from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from jobs.models import Skill
from datetime import datetime

from .models import (
    StudentProfile,
    Education,
    Project,
    Experience,
    Certification,
    Volunteering,
    ProfileSkill,
)
from .serializers import (
    StudentProfileSerializer,
    EducationSerializer,
    ProjectSerializer,
    ExperienceSerializer,
    CertificationSerializer,
    VolunteeringSerializer,
    ProfileSkillSerializer,
)


def parse_date(date_string):
    """Convert various date formats to date object"""
    if not date_string:
        return None
    try:
        # Try YYYY-MM format (month picker)
        if len(date_string) == 7 and '-' in date_string:
            return datetime.strptime(date_string + '-01', '%Y-%m-%d').date()
        # Try YYYY-MM-DD format
        return datetime.strptime(date_string, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return None


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudentProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        profile, created = StudentProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='create-profile')
    def create_profile(self, request):
        """
        Create or update complete student profile with all related data
        Expected payload:
        {
            "basic_info": {...},
            "educations": [...],
            "experiences": [...],
            "projects": [...],
            "skills": [...],
            "certifications": [...]
        }
        """
        try:
            with transaction.atomic():
                # Extract data from request
                basic_info = request.data.get('basic_info', {})
                educations_data = request.data.get('educations', [])
                experiences_data = request.data.get('experiences', [])
                projects_data = request.data.get('projects', [])
                skills_data = request.data.get('skills', [])
                certifications_data = request.data.get('certifications', [])

                # Create or update StudentProfile
                profile, created = StudentProfile.objects.get_or_create(user=request.user)
                profile.full_name = basic_info.get('full_name', profile.full_name)
                profile.date_of_birth = parse_date(basic_info.get('date_of_birth')) or profile.date_of_birth
                profile.location = basic_info.get('location', profile.location)
                profile.headline = basic_info.get('headline', profile.headline)
                profile.summary = basic_info.get('summary', profile.summary)
                profile.save()

                # Clear existing related data
                profile.educations.all().delete()
                profile.experiences.all().delete()
                profile.projects.all().delete()
                profile.certifications.all().delete()
                profile.profile_skills.all().delete()

                # Create Education entries
                for edu_data in educations_data:
                    Education.objects.create(
                        profile=profile,
                        institution=edu_data.get('institution', ''),
                        level=edu_data.get('level', 'other'),
                        field_of_study=edu_data.get('field_of_study', ''),
                        start_date=parse_date(edu_data.get('start_date')),
                        end_date=parse_date(edu_data.get('end_date')),
                        is_current=edu_data.get('currently_studying', False),
                        grade=edu_data.get('grade_gpa', ''),
                        description=edu_data.get('description', '')
                    )

                # Create Experience entries
                for exp_data in experiences_data:
                    Experience.objects.create(
                        profile=profile,
                        role_title=exp_data.get('job_title', ''),
                        company=exp_data.get('company', ''),
                        start_date=parse_date(exp_data.get('start_date')),
                        end_date=parse_date(exp_data.get('end_date')),
                        is_current=exp_data.get('currently_working', False),
                        description=exp_data.get('description', ''),
                        referral_name=exp_data.get('referral_name', ''),
                        referral_email=exp_data.get('referral_email', '')
                    )

                # Create Project entries
                for proj_data in projects_data:
                    Project.objects.create(
                        profile=profile,
                        title=proj_data.get('title', ''),
                        description=proj_data.get('description', ''),
                        technologies=proj_data.get('technologies', ''),
                        github_link=proj_data.get('github_link', ''),
                        live_link=proj_data.get('live_url', ''),
                        contribution=proj_data.get('your_contribution', ''),
                        start_date=parse_date(proj_data.get('start_date')),
                        end_date=parse_date(proj_data.get('end_date'))
                    )

                # Create Skill entries (ProfileSkill)
                for skill_data in skills_data:
                    skill_name = skill_data.get('name', '').strip()
                    if skill_name:
                        # Get or create the Skill in jobs.models
                        skill, _ = Skill.objects.get_or_create(name=skill_name)
                        
                        # Create ProfileSkill with proficiency
                        ProfileSkill.objects.create(
                            profile=profile,
                            skill=skill,
                            proficiency=skill_data.get('proficiency', 3),
                            source='manual'
                        )

                # Create Certification entries
                for cert_data in certifications_data:
                    Certification.objects.create(
                        profile=profile,
                        name=cert_data.get('name', ''),
                        issuer=cert_data.get('issuer', ''),
                        issue_date=parse_date(cert_data.get('issue_date')),
                        expiry_date=parse_date(cert_data.get('expiry_date')),
                        credential_url=cert_data.get('credential_url', '')
                    )

                return Response({
                    'profile_id': profile.id,
                    'message': 'Profile created successfully',
                    'readiness_scores': {
                        'startup_score': 0,  # TODO: Calculate using ReadinessCalculator
                        'corporate_score': 0,
                        'leading_score': 0
                    }
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class EducationViewSet(viewsets.ModelViewSet):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class ExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Experience.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class CertificationViewSet(viewsets.ModelViewSet):
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Certification.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class VolunteeringViewSet(viewsets.ModelViewSet):
    serializer_class = VolunteeringSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Volunteering.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class ProfileSkillViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProfileSkill.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)
