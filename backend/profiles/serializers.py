from rest_framework import serializers

from jobs.models import Skill
from .models import (
    StudentProfile,
    Education,
    Project,
    Experience,
    Certification,
    Volunteering,
    ProfileSkill,
)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class ProfileSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), source='skill', write_only=True
    )

    class Meta:
        model = ProfileSkill
        fields = ['id', 'skill', 'skill_id', 'source', 'proficiency', 'verification_score', 'is_primary']


class EducationSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), source='skills', write_only=True, required=False
    )

    class Meta:
        model = Education
        fields = [
            'id', 'institution', 'level', 'field_of_study', 'start_date', 
            'end_date', 'is_current', 'grade', 'description', 'skills', 'skill_ids'
        ]


class ProjectSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), source='skills', write_only=True, required=False
    )

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'organization', 'start_date', 'end_date', 'contribution',
            'description', 'technologies', 'tools', 'referral_name', 'referral_email',
            'live_link', 'github_link', 'skills', 'skill_ids'
        ]


class ExperienceSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), source='skills', write_only=True, required=False
    )

    class Meta:
        model = Experience
        fields = [
            'id', 'role_title', 'company', 'start_date', 'end_date', 'is_current',
            'description', 'referral_name', 'referral_email', 'skills', 'skill_ids'
        ]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuer', 'issue_date', 'expiry_date', 'credential_url']


class VolunteeringSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volunteering
        fields = ['id', 'organization', 'role', 'start_date', 'end_date', 'description']


class StudentProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    volunteering = VolunteeringSerializer(many=True, read_only=True)
    profile_skills = ProfileSkillSerializer(many=True, read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'full_name', 'date_of_birth', 'location', 'headline', 'summary',
            'educations', 'projects', 'experiences', 'certifications', 'volunteering', 'profile_skills',
            'created_at', 'updated_at'
        ]
