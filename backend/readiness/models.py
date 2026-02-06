from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from jobs.models import JobRole
from profiles.models import StudentProfile


class CompanyLevel(models.TextChoices):
    STARTUP = "startup", "Startup"
    CORPORATE = "corporate", "Corporate"
    LEADING = "leading", "Leading"


class ReadinessScore(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="readiness_scores")
    job_role = models.ForeignKey(JobRole, on_delete=models.CASCADE, related_name="readiness_scores")
    company_level = models.CharField(max_length=20, choices=CompanyLevel.choices)
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    verified_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    unverified_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    pillar_breakdown = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("profile", "job_role", "company_level")

    def __str__(self):
        return f"{self.profile} - {self.job_role} - {self.company_level}"
