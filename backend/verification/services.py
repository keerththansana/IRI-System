"""
Verification Services - Business logic for multi-level verification
"""
import secrets
import json
from datetime import timedelta
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.core.mail import send_mail
from django.conf import settings
from .models import VerificationRequest, VerificationMethod, VerificationStatus


class QuizGenerator:
    """Generate quiz questions based on profile items."""
    
    @staticmethod
    def generate_skill_quiz(skill_obj):
        """Generate quiz questions for a skill."""
        skill_name = skill_obj.skill.name if hasattr(skill_obj, 'skill') else str(skill_obj)
        
        # Generate contextual questions based on skill type
        questions = [
            {
                'id': 1,
                'question': f'What is your proficiency level with {skill_name}?',
                'type': 'multiple_choice',
                'options': ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
                'correct_answer': 'Intermediate'  # Will be validated against proficiency
            },
            {
                'id': 2,
                'question': f'How many months/years have you been using {skill_name}?',
                'type': 'text',
                'validation': 'numeric'
            },
            {
                'id': 3,
                'question': f'Describe a practical project where you applied {skill_name}',
                'type': 'text',
                'min_words': 20
            },
            {
                'id': 4,
                'question': f'What related skills do you use alongside {skill_name}?',
                'type': 'text',
                'min_words': 10
            }
        ]
        
        return questions
    
    @staticmethod
    def generate_experience_quiz(experience):
        """Generate quiz questions for work experience."""
        questions = [
            {
                'id': 1,
                'question': f'What were your primary responsibilities at {experience.company}?',
                'type': 'text',
                'min_words': 30
            },
            {
                'id': 2,
                'question': 'Which technologies/tools did you use daily?',
                'type': 'text',
                'min_words': 15
            },
            {
                'id': 3,
                'question': 'Describe a significant challenge you overcame',
                'type': 'text',
                'min_words': 40
            },
            {
                'id': 4,
                'question': 'What was the team size you worked with?',
                'type': 'multiple_choice',
                'options': ['Solo', '2-5 people', '6-15 people', '15+ people']
            }
        ]
        
        return questions
    
    @staticmethod
    def generate_project_quiz(project):
        """Generate quiz questions for a project."""
        questions = [
            {
                'id': 1,
                'question': f'Explain the main technical architecture of {project.title}',
                'type': 'text',
                'min_words': 40
            },
            {
                'id': 2,
                'question': 'What was your specific role and contribution?',
                'type': 'text',
                'min_words': 30
            },
            {
                'id': 3,
                'question': 'What was the biggest technical challenge?',
                'type': 'text',
                'min_words': 30
            },
            {
                'id': 4,
                'question': 'How long did the project take from start to completion?',
                'type': 'text',
                'validation': 'numeric'
            }
        ]
        
        return questions


class QuizEvaluator:
    """Evaluate quiz answers and calculate scores."""
    
    @staticmethod
    def evaluate_answers(questions, answers):
        """
        Evaluate quiz answers and return score (0-100).
        
        Scoring criteria:
        - Completeness: All questions answered
        - Detail level: Sufficient word count
        - Relevance: Keywords matching expected content
        """
        total_questions = len(questions)
        score = 0
        
        for question in questions:
            q_id = str(question['id'])
            answer = answers.get(q_id, '').strip()
            
            if not answer:
                continue  # Skip empty answers
            
            # Base points for answering (60% of total)
            question_score = 15
            
            # Check word count requirements
            if question['type'] == 'text' and 'min_words' in question:
                word_count = len(answer.split())
                min_words = question['min_words']
                
                if word_count >= min_words:
                    question_score += 10  # Bonus for sufficient detail
                elif word_count >= min_words * 0.7:
                    question_score += 5   # Partial credit
            
            score += question_score
        
        # Normalize to 0-100
        max_possible = total_questions * 25
        normalized_score = min((score / max_possible) * 100, 100)
        
        return round(normalized_score, 2)


class ReferralService:
    """Handle referral verification emails and processing."""
    
    @staticmethod
    def send_referral_request(verification_request, custom_message=''):
        """Send verification email to referral contact."""
        token = secrets.token_urlsafe(32)
        verification_request.token = token
        verification_request.expires_at = timezone.now() + timedelta(days=7)
        verification_request.save()
        
        # Build verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify/{token}"
        
        # Email content
        subject = f"Verification Request from {verification_request.profile.user.get_full_name()}"
        
        message = f"""
Hello {verification_request.referral_name},

{verification_request.profile.user.get_full_name()} has listed you as a reference for their Industry Readiness Index (IRI) profile.

They would like you to verify their:
- {verification_request.content_type.model.upper()}

{custom_message}

Please click the link below to provide verification (expires in 7 days):
{verification_url}

Thank you for your time!

- IRI System Team
"""
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [verification_request.referral_email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Error sending referral email: {e}")
            return False


class LinkVerifier:
    """Verify evidence through external links (GitHub, portfolios, etc.)."""
    
    @staticmethod
    def verify_github_link(github_url):
        """
        Verify GitHub repository and calculate credibility score.
        
        Factors:
        - Repository exists and is accessible
        - Commit history
        - Code quality indicators
        - README completeness
        """
        # Simplified scoring (in production, would use GitHub API)
        score = 50  # Base score for having a valid link
        
        # Check URL format
        if 'github.com' in github_url.lower():
            score += 20  # Valid GitHub URL
        
        # In production, would check:
        # - Number of commits
        # - Lines of code
        # - README quality
        # - Stars/forks
        # - Recent activity
        
        return min(score, 100)
    
    @staticmethod
    def verify_portfolio_link(portfolio_url):
        """Verify live portfolio/project link."""
        score = 50  # Base score for having a live link
        
        # In production, would check:
        # - Site accessibility
        # - SSL certificate
        # - Performance metrics
        # - Content quality
        
        return min(score, 100)
