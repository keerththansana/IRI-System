"""
Verification API Views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from django.utils import timezone

from profiles.models import StudentProfile, ProfileSkill, Experience, Project, Certification
from .models import VerificationRequest, VerificationMethod, VerificationStatus
from .serializers import (
    VerificationRequestSerializer,
    SelfVerificationRequestSerializer,
    SelfVerificationResponseSerializer,
    QuizSubmissionSerializer,
    ReferralVerificationRequestSerializer,
    LinkVerificationRequestSerializer,
    VerificationStatusSerializer
)
from .services import QuizGenerator, QuizEvaluator, ReferralService, LinkVerifier


class VerificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling all verification operations.
    
    Endpoints:
    - POST /api/verification/self-verification/ - Request self-verification quiz
    - POST /api/verification/submit-quiz/ - Submit quiz answers
    - POST /api/verification/referral-verification/ - Request referral verification
    - POST /api/verification/link-verification/ - Request link verification
    - GET /api/verification/status/ - Get verification status summary
    - GET /api/verification/ - List all verifications
    """
    serializer_class = VerificationRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter verifications for current user's profile."""
        try:
            profile = StudentProfile.objects.get(user=self.request.user)
            return VerificationRequest.objects.filter(profile=profile).order_by('-created_at')
        except StudentProfile.DoesNotExist:
            return VerificationRequest.objects.none()
    
    @action(detail=False, methods=['post'])
    def self_verification(self, request):
        """
        Request self-verification quiz for a profile item.
        
        POST /api/verification/self-verification/
        Body: {
            "item_type": "skill|experience|project",
            "item_id": 123
        }
        """
        serializer = SelfVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        item_type = serializer.validated_data['item_type']
        item_id = serializer.validated_data['item_id']
        
        # Get profile
        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found. Please create your profile first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the item to verify
        item = self._get_profile_item(item_type, item_id, profile)
        if not item:
            return Response(
                {'error': f'{item_type.capitalize()} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate quiz questions
        if item_type == 'skill':
            questions = QuizGenerator.generate_skill_quiz(item)
        elif item_type == 'experience':
            questions = QuizGenerator.generate_experience_quiz(item)
        elif item_type == 'project':
            questions = QuizGenerator.generate_project_quiz(item)
        else:
            return Response({'error': 'Invalid item type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create verification request
        content_type = ContentType.objects.get_for_model(item)
        verification = VerificationRequest.objects.create(
            profile=profile,
            content_type=content_type,
            object_id=item.id,
            method=VerificationMethod.SELF,
            status=VerificationStatus.PENDING,
            expires_at=timezone.now() + timezone.timedelta(hours=1)
        )
        
        response_data = {
            'verification_id': verification.id,
            'questions': questions,
            'expires_in_minutes': 60
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def submit_quiz(self, request):
        """
        Submit quiz answers for evaluation.
        
        POST /api/verification/submit-quiz/
        Body: {
            "verification_id": 123,
            "answers": {
                "1": "answer to question 1",
                "2": "answer to question 2"
            }
        }
        """
        serializer = QuizSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        verification_id = serializer.validated_data['verification_id']
        answers = serializer.validated_data['answers']
        
        # Get verification request
        try:
            profile = StudentProfile.objects.get(user=request.user)
            verification = VerificationRequest.objects.get(
                id=verification_id,
                profile=profile,
                method=VerificationMethod.SELF,
                status=VerificationStatus.PENDING
            )
        except VerificationRequest.DoesNotExist:
            return Response(
                {'error': 'Verification request not found or already completed'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if expired
        if verification.expires_at and verification.expires_at < timezone.now():
            verification.status = VerificationStatus.EXPIRED
            verification.save()
            return Response(
                {'error': 'Verification has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Retrieve original questions (in production, store these in DB)
        item = verification.content_object
        if isinstance(item, ProfileSkill):
            questions = QuizGenerator.generate_skill_quiz(item)
        elif isinstance(item, Experience):
            questions = QuizGenerator.generate_experience_quiz(item)
        elif isinstance(item, Project):
            questions = QuizGenerator.generate_project_quiz(item)
        else:
            return Response({'error': 'Invalid item type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Evaluate answers
        score = QuizEvaluator.evaluate_answers(questions, answers)
        
        # Update verification
        verification.score = score
        verification.status = VerificationStatus.APPROVED if score >= 60 else VerificationStatus.REJECTED
        verification.completed_at = timezone.now()
        verification.save()
        
        return Response({
            'verification_id': verification.id,
            'score': float(score),
            'status': verification.status,
            'message': 'Quiz passed! Verification approved.' if score >= 60 else 'Score too low. Please try again.'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def referral_verification(self, request):
        """
        Request referral verification (sends email to referrer).
        
        POST /api/verification/referral-verification/
        Body: {
            "item_type": "experience|project",
            "item_id": 123,
            "referral_name": "John Doe",
            "referral_email": "john@example.com",
            "message": "Optional custom message"
        }
        """
        serializer = ReferralVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        item_type = serializer.validated_data['item_type']
        item_id = serializer.validated_data['item_id']
        referral_name = serializer.validated_data['referral_name']
        referral_email = serializer.validated_data['referral_email']
        custom_message = serializer.validated_data.get('message', '')
        
        # Get profile
        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the item
        item = self._get_profile_item(item_type, item_id, profile)
        if not item:
            return Response(
                {'error': f'{item_type.capitalize()} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create verification request
        content_type = ContentType.objects.get_for_model(item)
        verification = VerificationRequest.objects.create(
            profile=profile,
            content_type=content_type,
            object_id=item.id,
            method=VerificationMethod.REFERRAL,
            status=VerificationStatus.PENDING,
            referral_name=referral_name,
            referral_email=referral_email
        )
        
        # Send email
        email_sent = ReferralService.send_referral_request(verification, custom_message)
        
        if not email_sent:
            return Response(
                {'error': 'Failed to send verification email. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'verification_id': verification.id,
            'message': f'Verification email sent to {referral_email}',
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def link_verification(self, request):
        """
        Request link-based verification (GitHub, portfolio, etc.).
        
        POST /api/verification/link-verification/
        Body: {
            "item_type": "project|certification",
            "item_id": 123,
            "evidence_url": "https://github.com/user/repo"
        }
        """
        serializer = LinkVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        item_type = serializer.validated_data['item_type']
        item_id = serializer.validated_data['item_id']
        evidence_url = serializer.validated_data['evidence_url']
        
        # Get profile
        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the item
        item = self._get_profile_item(item_type, item_id, profile)
        if not item:
            return Response(
                {'error': f'{item_type.capitalize()} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify the link
        if 'github.com' in evidence_url.lower():
            score = LinkVerifier.verify_github_link(evidence_url)
        else:
            score = LinkVerifier.verify_portfolio_link(evidence_url)
        
        # Create verification request
        content_type = ContentType.objects.get_for_model(item)
        verification = VerificationRequest.objects.create(
            profile=profile,
            content_type=content_type,
            object_id=item.id,
            method=VerificationMethod.LINK,
            status=VerificationStatus.APPROVED if score >= 50 else VerificationStatus.PENDING,
            evidence_url=evidence_url,
            score=score,
            completed_at=timezone.now() if score >= 50 else None
        )
        
        return Response({
            'verification_id': verification.id,
            'score': float(score),
            'status': verification.status,
            'message': 'Link verified successfully!' if score >= 50 else 'Link verification pending review.'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """
        Get verification status summary for current user.
        
        GET /api/verification/status/
        """
        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        verifications = VerificationRequest.objects.filter(profile=profile)
        
        # Calculate summary
        total = verifications.count()
        pending = verifications.filter(status=VerificationStatus.PENDING).count()
        approved = verifications.filter(status=VerificationStatus.APPROVED).count()
        rejected = verifications.filter(status=VerificationStatus.REJECTED).count()
        
        by_method = {
            'self': verifications.filter(method=VerificationMethod.SELF).count(),
            'referral': verifications.filter(method=VerificationMethod.REFERRAL).count(),
            'link': verifications.filter(method=VerificationMethod.LINK).count(),
        }
        
        recent = verifications.order_by('-created_at')[:5]
        
        return Response({
            'total_verifications': total,
            'pending': pending,
            'approved': approved,
            'rejected': rejected,
            'by_method': by_method,
            'recent_verifications': VerificationRequestSerializer(recent, many=True).data
        }, status=status.HTTP_200_OK)
    
    def _get_profile_item(self, item_type, item_id, profile):
        """Helper to get profile item by type and ID."""
        try:
            if item_type == 'skill':
                return ProfileSkill.objects.get(id=item_id, profile=profile)
            elif item_type == 'experience':
                return Experience.objects.get(id=item_id, profile=profile)
            elif item_type == 'project':
                return Project.objects.get(id=item_id, profile=profile)
            elif item_type == 'certification':
                return Certification.objects.get(id=item_id, profile=profile)
        except (ProfileSkill.DoesNotExist, Experience.DoesNotExist, 
                Project.DoesNotExist, Certification.DoesNotExist):
            return None
