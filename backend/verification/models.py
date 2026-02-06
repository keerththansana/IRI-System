from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from profiles.models import StudentProfile


class VerificationMethod(models.TextChoices):
    SELF = "self", "Self"
    REFERRAL = "referral", "Referral"
    LINK = "link", "Link"


class VerificationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    EXPIRED = "expired", "Expired"


class VerificationRequest(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="verification_requests")
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
    method = models.CharField(max_length=20, choices=VerificationMethod.choices)
    status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    referral_name = models.CharField(max_length=200, blank=True)
    referral_email = models.EmailField(blank=True)
    evidence_url = models.URLField(blank=True)
    token = models.CharField(max_length=64, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["content_type", "object_id"])]

    def __str__(self):
        return f"{self.profile} - {self.method} - {self.status}"
