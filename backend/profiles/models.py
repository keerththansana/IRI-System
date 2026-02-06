from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from jobs.models import Skill


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_profile"
    )
    full_name = models.CharField(max_length=200, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    headline = models.CharField(max_length=200, blank=True)
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name or self.user.username


class Education(models.Model):
    class Level(models.TextChoices):
        PRIMARY = "primary", "Primary"
        SECONDARY = "secondary", "Secondary"
        DIPLOMA = "diploma", "Diploma"
        DEGREE = "degree", "Degree"
        POSTGRAD = "postgrad", "Postgraduate"
        OTHER = "other", "Other"

    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="educations")
    institution = models.CharField(max_length=200)
    level = models.CharField(max_length=30, choices=Level.choices)
    field_of_study = models.CharField(max_length=200, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    grade = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    skills = models.ManyToManyField(Skill, blank=True, related_name="education_entries")

    def __str__(self):
        return f"{self.institution} - {self.level}"


class Project(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=200)
    organization = models.CharField(max_length=200, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    contribution = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    technologies = models.TextField(blank=True)
    tools = models.TextField(blank=True)
    referral_name = models.CharField(max_length=200, blank=True)
    referral_email = models.EmailField(blank=True)
    live_link = models.URLField(blank=True)
    github_link = models.URLField(blank=True)
    skills = models.ManyToManyField(Skill, blank=True, related_name="project_entries")

    def __str__(self):
        return self.title


class Experience(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="experiences")
    role_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    referral_name = models.CharField(max_length=200, blank=True)
    referral_email = models.EmailField(blank=True)
    skills = models.ManyToManyField(Skill, blank=True, related_name="experience_entries")

    def __str__(self):
        return f"{self.role_title} at {self.company}"


class Certification(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="certifications")
    name = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    credential_url = models.URLField(blank=True)

    def __str__(self):
        return self.name


class Volunteering(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="volunteering")
    organization = models.CharField(max_length=200)
    role = models.CharField(max_length=200, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.organization


class ProfileSkill(models.Model):
    class Source(models.TextChoices):
        MANUAL = "manual", "Manual"
        EDUCATION = "education", "Education"
        PROJECT = "project", "Project"
        EXPERIENCE = "experience", "Experience"
        CERTIFICATION = "certification", "Certification"
        VOLUNTEERING = "volunteering", "Volunteering"

    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="profile_skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    source = models.CharField(max_length=30, choices=Source.choices, default=Source.MANUAL)
    proficiency = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    verification_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    is_primary = models.BooleanField(default=False)

    class Meta:
        unique_together = ("profile", "skill")

    def __str__(self):
        return f"{self.profile} - {self.skill}"
