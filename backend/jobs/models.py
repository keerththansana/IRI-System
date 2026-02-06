from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Pillar(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    default_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class SubPillar(models.Model):
    pillar = models.ForeignKey(Pillar, on_delete=models.CASCADE, related_name="sub_pillars")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.0,
    )

    class Meta:
        unique_together = ("pillar", "name")

    def __str__(self):
        return f"{self.pillar.name} - {self.name}"


class Skill(models.Model):
    name = models.CharField(max_length=120, unique=True)
    pillar = models.ForeignKey(Pillar, on_delete=models.SET_NULL, null=True, blank=True)
    sub_pillar = models.ForeignKey(SubPillar, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name


class JobRole(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class JobPillarWeight(models.Model):
    job_role = models.ForeignKey(JobRole, on_delete=models.CASCADE, related_name="pillar_weights")
    pillar = models.ForeignKey(Pillar, on_delete=models.CASCADE)
    weight_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    class Meta:
        unique_together = ("job_role", "pillar")

    def __str__(self):
        return f"{self.job_role.name} - {self.pillar.name}"


class JobSubPillarWeight(models.Model):
    job_role = models.ForeignKey(JobRole, on_delete=models.CASCADE, related_name="sub_pillar_weights")
    sub_pillar = models.ForeignKey(SubPillar, on_delete=models.CASCADE)
    weight_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    class Meta:
        unique_together = ("job_role", "sub_pillar")

    def __str__(self):
        return f"{self.job_role.name} - {self.sub_pillar.name}"
