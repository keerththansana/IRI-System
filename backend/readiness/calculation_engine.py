"""
Industry Readiness Index (IRI) Calculation Engine

Calculates readiness scores based on:
1. Pillar scores (sum of weighted sub-pillar scores)
2. Job-specific pillar weights
3. Verification levels (self, referral, link)
4. Company level adjustments (startup, corporate, leading)
"""

from decimal import Decimal
from django.db.models import Sum, Q
from django.utils import timezone
from django.contrib.auth.models import User
from jobs.models import Pillar, SubPillar, JobPillarWeight, Skill
from profiles.models import StudentProfile, Experience, Project, Certification, ProfileSkill
from verification.models import VerificationRequest


class ReadinessCalculator:
    """Core calculation engine for IRI scores."""
    
    # Verification level weights (impact on score)
    VERIFICATION_WEIGHTS = {
        'self': Decimal('0.60'),          # 60% weight for self-verification (quiz)
        'referral': Decimal('0.30'),      # 30% weight for referral verification
        'link': Decimal('0.10')           # 10% weight for link/portfolio verification
    }
    
    # Company level multipliers
    COMPANY_LEVEL_MULTIPLIERS = {
        'startup': Decimal('1.0'),        # Base level
        'corporate': Decimal('1.15'),     # 15% higher expectations
        'leading': Decimal('1.30')        # 30% higher expectations (FAANG-level)
    }
    
    def __init__(self, user):
        """Initialize calculator with user profile."""
        self.user = user
        try:
            self.profile = StudentProfile.objects.get(user=user)
        except StudentProfile.DoesNotExist:
            self.profile = None
    
    def calculate_iri(self, job_role, company_level='startup'):
        """
        Calculate complete Industry Readiness Index for a user for a specific job role.
        
        Args:
            job_role: JobRole instance
            company_level: 'startup', 'corporate', or 'leading'
        
        Returns:
            {
                'iri_score': 0-100,
                'breakdown': {
                    'pillar_name': {
                        'score': 0-100,
                        'weight_percent': 40,
                        'weighted_contribution': 16
                    }
                },
                'verification_impact': {...},
                'company_adjustment': {...},
                'strengths': [...],
                'gaps': [...]
            }
        """
        if not self.profile:
            return self._empty_result(company_level)
        
        # Step 1: Get job-pillar weights for this role
        job_weights = self._get_job_weights(job_role)
        if not job_weights:
            return self._empty_result(company_level)
        
        # Step 2: Calculate pillar scores
        pillars = Pillar.objects.all()
        pillar_scores = {}
        total_weighted_score = Decimal('0')
        
        for pillar in pillars:
            pillar_score = self._calculate_pillar_score(pillar)
            weight = job_weights.get(pillar.id, Decimal('0'))
            weighted_contribution = (pillar_score * weight) / Decimal('100')
            
            pillar_scores[pillar.id] = {
                'name': pillar.name,
                'score': float(pillar_score),
                'weight_percent': float(weight),
                'weighted_contribution': float(weighted_contribution)
            }
            
            total_weighted_score += weighted_contribution
        
        # Step 3: Apply company level adjustment
        company_multiplier = self.COMPANY_LEVEL_MULTIPLIERS.get(company_level, Decimal('1.0'))
        adjusted_score = min(total_weighted_score * company_multiplier, Decimal('100'))
        
        # Step 4: Identify strengths and gaps
        strengths, gaps = self._identify_strengths_gaps(pillar_scores)
        
        # Step 5: Build verification impact summary
        verification_impact = self._calculate_verification_impact()
        
        return {
            'iri_score': float(adjusted_score),
            'base_score': float(total_weighted_score),
            'breakdown': pillar_scores,
            'verification_impact': verification_impact,
            'company_level': company_level,
            'company_multiplier': float(company_multiplier),
            'strengths': strengths,
            'gaps': gaps,
            'recommendations': self._generate_recommendations(gaps, job_role)
        }
    
    def _calculate_pillar_score(self, pillar):
        """
        Calculate score for a single pillar.
        
        Formula: Pillar_Score = Σ(SubPillar_Score × SubPillar_Weight) / Σ(SubPillar_Weight)
        
        SubPillar_Score is derived from:
        - Skills matching this sub-pillar (with verification levels applied)
        - Experiences relevant to this sub-pillar
        - Projects demonstrating this sub-pillar
        - Certifications in this sub-pillar
        """
        sub_pillars = SubPillar.objects.filter(pillar=pillar)
        
        if not sub_pillars.exists():
            return Decimal('0')
        
        total_weighted_score = Decimal('0')
        total_weight = Decimal('0')
        
        for sub_pillar in sub_pillars:
            sub_score = self._calculate_sub_pillar_score(sub_pillar)
            weight = sub_pillar.weight
            
            total_weighted_score += sub_score * weight
            total_weight += weight
        
        if total_weight == 0:
            return Decimal('0')
        
        pillar_score = total_weighted_score / total_weight
        return pillar_score
    
    def _calculate_sub_pillar_score(self, sub_pillar):
        """
        Calculate score for a sub-pillar (0-100).
        
        Components:
        1. Skills score (40% weight)
        2. Experience score (30% weight)
        3. Project score (20% weight)
        4. Certification score (10% weight)
        """
        if not self.profile:
            return Decimal('0')
        
        # Get component scores
        skills_score = self._calculate_skills_score(sub_pillar)
        experience_score = self._calculate_experience_score(sub_pillar)
        project_score = self._calculate_project_score(sub_pillar)
        certification_score = self._calculate_certification_score(sub_pillar)
        
        # Weighted average
        total_score = (
            (skills_score * Decimal('0.40')) +
            (experience_score * Decimal('0.30')) +
            (project_score * Decimal('0.20')) +
            (certification_score * Decimal('0.10'))
        )
        
        return min(total_score, Decimal('100'))
    
    def _calculate_skills_score(self, sub_pillar):
        """
        Calculate skill-based score for a sub-pillar.
        
        Scores each skill by verification level:
        - Self-verified (quiz): 60 points base
        - Referral-verified: 30 points
        - Link-verified (GitHub, portfolio): 10 points
        """
        skills = Skill.objects.filter(
            profileskill__profile=self.profile,
            sub_pillar=sub_pillar
        ).distinct()
        
        if not skills.exists():
            return Decimal('0')
        
        total_score = Decimal('0')
        
        for skill in skills:
            verification = VerificationRequest.objects.filter(
                profile=self.profile,
                ).first()
            
            if not verification:
                # Unverified skill: 20 points
                total_score += Decimal('20')
            elif verification.method == 'self':
                # Self-verified: 60 points if approved, 30 if pending
                score = Decimal('60') if verification.status == 'approved' else Decimal('30')
                total_score += score
            elif verification.method == 'referral':
                # Referral-verified: 30 points
                total_score += Decimal('30') if verification.status == 'approved' else Decimal('15')
            elif verification.method == 'link':
                # Link-verified: 10 + credibility analysis
                if verification.status == 'approved':
                    credibility_bonus = Decimal(verification.score or 0)
                    total_score += Decimal('10') + credibility_bonus
                else:
                    total_score += Decimal('5')
        
        # Average across all skills (normalize to 0-100)
        avg_score = total_score / skills.count()
        return min(avg_score, Decimal('100'))
    
    def _calculate_experience_score(self, sub_pillar):
        """
        Calculate experience-based score for a sub-pillar.
        
        Considers:
        - Years of relevant experience
        - Job titles matching sub-pillar keywords
        - Company tier/prestige
        - Responsibilities listed
        """
        experiences = Experience.objects.filter(profile=self.profile)
        
        if not experiences.exists():
            return Decimal('0')
        
        total_score = Decimal('0')
        relevant_count = 0
        
        for exp in experiences:
            # Match experience based on title and description keywords
            relevance_score = self._calculate_experience_relevance(exp, sub_pillar)
            
            if relevance_score > 0:
                # Calculate years of experience
                years = self._calculate_years(exp.start_date, exp.end_date, exp.is_current)
                years_score = min(Decimal(years) * Decimal('10'), Decimal('50'))
                
                # Company tier bonus
                company_bonus = self._get_company_tier_bonus(exp.company)
                
                total_score += years_score + company_bonus
                relevant_count += 1
        
        if relevant_count == 0:
            return Decimal('0')
        
        avg_score = total_score / relevant_count
        return min(avg_score, Decimal('100'))
    
    def _calculate_project_score(self, sub_pillar):
        """
        Calculate project-based score for a sub-pillar.
        
        Considers:
        - Project complexity (lines of code, features)
        - Technologies used matching sub-pillar
        - GitHub stars/forks
        - Live deployment
        """
        projects = Project.objects.filter(profile=self.profile)
        
        if not projects.exists():
            return Decimal('0')
        
        total_score = Decimal('0')
        relevant_count = 0
        
        for project in projects:
            # Match project based on technologies and description
            relevance_score = self._calculate_project_relevance(project, sub_pillar)
            
            if relevance_score > 0:
                # Score based on complexity
                complexity_score = self._calculate_project_complexity(project)
                # GitHub credibility
                github_score = self._get_github_score(project.github_link)
                # Deployment bonus
                deployment_bonus = Decimal('15') if project.live_link else Decimal('0')
                
                total_score += complexity_score + github_score + deployment_bonus
                relevant_count += 1
        
        if relevant_count == 0:
            return Decimal('0')
        
        avg_score = total_score / relevant_count
        return min(avg_score, Decimal('100'))
    
    def _calculate_certification_score(self, sub_pillar):
        """
        Calculate certification-based score for a sub-pillar.
        
        Considers:
        - Certification relevance to sub-pillar
        - Certification prestige level
        - Expiration status
        """
        certifications = Certification.objects.filter(profile=self.profile)
        
        if not certifications.exists():
            return Decimal('0')
        
        total_score = Decimal('0')
        relevant_count = 0
        
        for cert in certifications:
            # Match certification based on name and description
            relevance_score = self._calculate_certification_relevance(cert, sub_pillar)
            
            if relevance_score > 0:
                # Base score for certification
                base_score = Decimal('60')
                
                # Prestige multiplier (AWS, GCP, Azure, etc.)
                prestige_multiplier = self._get_certification_prestige(cert.issuer)
                
                # Check expiration
                if cert.expiry_date and cert.expiry_date < timezone.now().date():
                    base_score *= Decimal('0.5')  # 50% penalty if expired
                
                total_score += base_score * prestige_multiplier
                relevant_count += 1
        
        if relevant_count == 0:
            return Decimal('0')
        
        avg_score = total_score / relevant_count
        return min(avg_score, Decimal('100'))
    
    def _get_job_weights(self, job_role):
        """Get pillar weights for a specific job role."""
        weights_qs = JobPillarWeight.objects.filter(job_role=job_role)
        
        return {
            weight.pillar.id: Decimal(str(weight.weight_percent))
            for weight in weights_qs
        }
    
    def _calculate_experience_relevance(self, experience, sub_pillar):
        """
        Calculate how relevant an experience is to a sub-pillar (0-1 scale).
        Uses keyword matching on title and description.
        """
        keywords = {
            'Programming Languages': ['python', 'java', 'javascript', 'cpp', 'c#', 'go', 'rust'],
            'Frameworks & Libraries': ['react', 'django', 'flask', 'spring', 'node'],
            'Databases': ['sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'],
            'DevOps & Cloud': ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd'],
            'Tools & Technologies': ['git', 'jira', 'linux', 'windows', 'mac'],
            'Problem Solving': ['debug', 'troubleshoot', 'solve', 'optimize', 'performance'],
            'Logical Thinking': ['algorithm', 'logic', 'architecture', 'design', 'pattern'],
            'Learning Agility': ['learn', 'training', 'certification', 'course', 'upskill'],
            'Analytical Thinking': ['analyze', 'analytics', 'data', 'metrics', 'report'],
            'Research Ability': ['research', 'experiment', 'innovation', 'poc', 'prototype'],
            'Communication': ['present', 'documentation', 'communicate', 'write', 'speak'],
            'Teamwork & Collaboration': ['team', 'collaborate', 'mentor', 'lead', 'coordinate'],
            'Leadership': ['lead', 'manage', 'direct', 'oversee', 'responsible'],
            'Adaptability': ['adapt', 'flexible', 'change', 'pivot', 'agile'],
            'Reliability & Work Ethic': ['deliver', 'reliable', 'consistent', 'deadline', 'quality'],
        }
        
        keywords_list = keywords.get(sub_pillar.name, [])
        full_text = f"{experience.role_title} {experience.description}".lower()
        
        matches = sum(1 for kw in keywords_list if kw in full_text)
        relevance = min(Decimal(matches) / max(Decimal(len(keywords_list)), Decimal('1')), Decimal('1'))
        
        return relevance
    
    def _calculate_project_relevance(self, project, sub_pillar):
        """Calculate how relevant a project is to a sub-pillar."""
        # Match based on technologies and description
        keywords = {
            'Programming Languages': ['python', 'javascript', 'java', 'typescript', 'kotlin'],
            'Frameworks & Libraries': ['react', 'vue', 'angular', 'django', 'fastapi'],
            'Databases': ['postgresql', 'mongodb', 'mysql', 'redis', 'dynamodb'],
            'DevOps & Cloud': ['docker', 'kubernetes', 'aws', 'gcp', 'terraform'],
            'Tools & Technologies': ['git', 'api', 'rest', 'graphql', 'websocket'],
        }
        
        keywords_list = keywords.get(sub_pillar.name, [])
        full_text = f"{project.title} {project.description} {project.technologies}".lower()
        
        matches = sum(1 for kw in keywords_list if kw in full_text)
        relevance = min(Decimal(matches) / max(Decimal(len(keywords_list)), Decimal('1')), Decimal('1'))
        
        return relevance
    
    def _calculate_certification_relevance(self, certification, sub_pillar):
        """Calculate how relevant a certification is to a sub-pillar."""
        keywords = {
            'Programming Languages': ['python', 'java', 'javascript'],
            'Frameworks & Libraries': ['react', 'django', 'spring'],
            'Databases': ['sql', 'mongodb', 'nosql'],
            'DevOps & Cloud': ['aws', 'gcp', 'azure', 'devops'],
            'Tools & Technologies': ['linux', 'kubernetes'],
        }
        
        keywords_list = keywords.get(sub_pillar.name, [])
        full_text = f"{certification.name} {certification.issuer}".lower()
        
        matches = sum(1 for kw in keywords_list if kw in full_text)
        relevance = min(Decimal(matches) / max(Decimal(len(keywords_list)), Decimal('1')), Decimal('1'))
        
        return relevance
    
    def _calculate_project_complexity(self, project):
        """Calculate project complexity score (0-50)."""
        # Simplified: based on description length and features count
        complexity = min(Decimal(len(project.description or '')) / Decimal('20'), Decimal('50'))
        return complexity
    
    def _get_github_score(self, github_url):
        """Get GitHub credibility score (0-20)."""
        # In production, would fetch actual GitHub stats
        if not github_url:
            return Decimal('0')
        return Decimal('10')  # Base score for having GitHub link
    
    def _get_company_tier_bonus(self, company_name):
        """Get bonus score for company tier (0-30)."""
        faang = ['google', 'apple', 'facebook', 'amazon', 'microsoft', 'meta']
        startups = ['startup', 'inc', 'labs', 'ai']
        
        if any(x in company_name.lower() for x in faang):
            return Decimal('30')
        elif any(x in company_name.lower() for x in startups):
            return Decimal('15')
        else:
            return Decimal('10')
    
    def _get_certification_prestige(self, issuer):
        """Get certification prestige multiplier."""
        high_prestige = ['aws', 'gcp', 'azure', 'oracle', 'cisco', 'linux']
        medium_prestige = ['coursera', 'udacity', 'google', 'microsoft']
        
        issuer_lower = issuer.lower() if issuer else ''
        
        if any(x in issuer_lower for x in high_prestige):
            return Decimal('1.5')
        elif any(x in issuer_lower for x in medium_prestige):
            return Decimal('1.2')
        else:
            return Decimal('1.0')
    
    def _calculate_years(self, start_date, end_date, is_current):
        """Calculate years of experience between two dates."""
        if not start_date:
            return 0
        
        from datetime import date
        end = end_date if end_date and not is_current else date.today()
        
        years = (end - start_date).days / 365.25
        return max(0, round(years, 1))
    
    def _calculate_verification_impact(self):
        """Calculate how verification activities impact the overall score."""
        verifications = VerificationRequest.objects.filter(profile=self.profile)
        
        total_count = verifications.count()
        verified_count = verifications.filter(status='approved').count()
        
        by_type = {}
        for vtype in ['self', 'referral', 'link']:
            count = verifications.filter(method=vtype).count()
            verified = verifications.filter(method=vtype, status='approved').count()
            
            by_type[vtype] = {
                'total': count,
                'verified': verified,
                'percentage': float((verified / count * 100) if count > 0 else 0)
            }
        
        return {
            'total_verifications': total_count,
            'verified_count': verified_count,
            'verification_rate': float((verified_count / total_count * 100) if total_count > 0 else 0),
            'by_type': by_type
        }
    
    def _identify_strengths_gaps(self, pillar_scores):
        """
        Identify top 3 strengths and top 3 gaps.
        
        Returns:
            (strengths, gaps) - lists of dicts with pillar name and score
        """
        sorted_pillars = sorted(
            pillar_scores.items(),
            key=lambda x: x[1]['score'],
            reverse=True
        )
        
        strengths = [
            {
                'pillar': item[1]['name'],
                'score': item[1]['score']
            }
            for item in sorted_pillars[:3]
        ]
        
        gaps = [
            {
                'pillar': item[1]['name'],
                'score': item[1]['score']
            }
            for item in sorted_pillars[-3:]
        ]
        
        return strengths, gaps
    
    def _generate_recommendations(self, gaps, job_role):
        """Generate actionable recommendations based on gaps."""
        recommendations = []
        
        for gap in gaps:
            pillar_name = gap['pillar']
            recommendations.append({
                'area': pillar_name,
                'priority': 'high' if gap['score'] < 30 else 'medium',
                'suggestion': self._get_recommendation_text(pillar_name, job_role)
            })
        
        return recommendations
    
    def _get_recommendation_text(self, pillar_name, job_role):
        """Get specific recommendation text for a pillar."""
        recommendations_map = {
            'Technical Skills': f"Strengthen your technical skills in areas required for {job_role.name}. Consider online courses or side projects.",
            'Cognitive Abilities': "Improve problem-solving and analytical thinking through coding challenges and algorithm practice.",
            'Behavioral Competencies': "Develop communication, teamwork, and leadership skills through group projects and presentations.",
            'Domain Knowledge': f"Increase your understanding of IT industry trends and best practices relevant to {job_role.name}."
        }
        
        return recommendations_map.get(pillar_name, "Work on improving this area.")
    
    def _empty_result(self, company_level='startup'):
        """Return empty result when profile is incomplete."""
        company_multiplier = self.COMPANY_LEVEL_MULTIPLIERS.get(company_level, Decimal('1.0'))
        return {
            'iri_score': 0,
            'base_score': 0,
            'breakdown': [],
            'verification_impact': {
                'total_verifications': 0,
                'verified_count': 0,
                'verification_rate': 0,
                'by_type': {}
            },
            'company_level': company_level,
            'company_multiplier': float(company_multiplier),
            'strengths': [],
            'gaps': [],
            'recommendations': [],
            'error': 'Profile incomplete. Please add skills, experience, and projects.'
        }
