from decimal import Decimal
from collections import defaultdict

from jobs.models import JobRole, JobPillarWeight, Skill
from profiles.models import StudentProfile, ProfileSkill
from readiness.models import ReadinessScore, CompanyLevel


class ReadinessCalculator:
    def __init__(self, profile: StudentProfile, job_role: JobRole):
        self.profile = profile
        self.job_role = job_role
        self.pillar_weights = {}
        self._load_weights()

    def _load_weights(self):
        weights = JobPillarWeight.objects.filter(job_role=self.job_role).select_related('pillar')
        for weight in weights:
            self.pillar_weights[weight.pillar.id] = {
                'pillar': weight.pillar,
                'weight': weight.weight_percent,
            }

    def calculate(self, company_level: str) -> dict:
        # Get profile skills grouped by pillar
        profile_skills = ProfileSkill.objects.filter(profile=self.profile).select_related('skill', 'skill__pillar')
        
        pillar_scores = defaultdict(lambda: {'total': 0, 'count': 0, 'verified': 0, 'unverified': 0})
        
        for ps in profile_skills:
            if not ps.skill.pillar:
                continue
            
            pillar_id = ps.skill.pillar.id
            score = ps.verification_score
            
            pillar_scores[pillar_id]['total'] += score
            pillar_scores[pillar_id]['count'] += 1
            
            if ps.verification_score > 0:
                pillar_scores[pillar_id]['verified'] += score
            else:
                pillar_scores[pillar_id]['unverified'] += score

        # Calculate weighted score
        total_score = Decimal(0)
        verified_score = Decimal(0)
        unverified_score = Decimal(0)
        breakdown = {}

        for pillar_id, weight_info in self.pillar_weights.items():
            pillar = weight_info['pillar']
            weight = Decimal(weight_info['weight'])
            
            scores = pillar_scores[pillar_id]
            if scores['count'] > 0:
                avg_score = Decimal(scores['total']) / Decimal(scores['count'])
                pillar_contribution = (avg_score * weight) / Decimal(100)
                total_score += pillar_contribution
                
                if scores['verified'] > 0:
                    verified_score += pillar_contribution
                else:
                    unverified_score += pillar_contribution
                
                breakdown[pillar.name] = {
                    'score': float(avg_score),
                    'weight': float(weight),
                    'contribution': float(pillar_contribution),
                }
            else:
                breakdown[pillar.name] = {
                    'score': 0,
                    'weight': float(weight),
                    'contribution': 0,
                }

        # Apply company level multiplier
        multipliers = {
            CompanyLevel.STARTUP: Decimal('0.7'),
            CompanyLevel.CORPORATE: Decimal('0.85'),
            CompanyLevel.LEADING: Decimal('1.0'),
        }
        
        multiplier = multipliers.get(company_level, Decimal('1.0'))
        final_score = total_score * multiplier
        
        # Cap at 100
        final_score = min(final_score, Decimal(100))
        verified_score = min(verified_score * multiplier, Decimal(100))
        unverified_score = min(unverified_score * multiplier, Decimal(100))

        return {
            'score': final_score,
            'verified_score': verified_score,
            'unverified_score': unverified_score,
            'breakdown': breakdown,
        }

    def calculate_all_levels(self):
        results = {}
        for level in [CompanyLevel.STARTUP, CompanyLevel.CORPORATE, CompanyLevel.LEADING]:
            result = self.calculate(level)
            
            # Save to database
            ReadinessScore.objects.update_or_create(
                profile=self.profile,
                job_role=self.job_role,
                company_level=level,
                defaults={
                    'score': result['score'],
                    'verified_score': result['verified_score'],
                    'unverified_score': result['unverified_score'],
                    'pillar_breakdown': result['breakdown'],
                }
            )
            
            results[level] = result
        
        return results
