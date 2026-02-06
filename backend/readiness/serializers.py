from rest_framework import serializers
from .models import ReadinessScore
from jobs.models import JobRole


class ReadinessScoreSerializer(serializers.ModelSerializer):
    job_role_name = serializers.CharField(source='job_role.name', read_only=True)
    
    class Meta:
        model = ReadinessScore
        fields = [
            'id', 'job_role', 'job_role_name', 'company_level', 'score',
            'verified_score', 'unverified_score', 'pillar_breakdown', 'updated_at'
        ]
        read_only_fields = ['score', 'verified_score', 'unverified_score', 'pillar_breakdown', 'updated_at']


class ReadinessCalculationRequestSerializer(serializers.Serializer):
    """Request serializer for readiness calculation."""
    job_role_id = serializers.IntegerField()
    company_level = serializers.ChoiceField(
        choices=['startup', 'corporate', 'leading'],
        default='startup'
    )


class PillarBreakdownItemSerializer(serializers.Serializer):
    """Single pillar in breakdown."""
    name = serializers.CharField()
    score = serializers.FloatField()
    weight_percent = serializers.FloatField()
    weighted_contribution = serializers.FloatField()


class VerificationImpactSerializer(serializers.Serializer):
    """Verification impact statistics."""
    total_verifications = serializers.IntegerField()
    verified_count = serializers.IntegerField()
    verification_rate = serializers.FloatField()
    by_type = serializers.DictField()


class StrengthGapItemSerializer(serializers.Serializer):
    """Single strength or gap item."""
    pillar = serializers.CharField()
    score = serializers.FloatField()


class RecommendationItemSerializer(serializers.Serializer):
    """Single recommendation."""
    area = serializers.CharField()
    priority = serializers.CharField()
    suggestion = serializers.CharField()


class ReadinessResultSerializer(serializers.Serializer):
    """Complete readiness calculation result."""
    iri_score = serializers.FloatField()
    base_score = serializers.FloatField()
    company_level = serializers.CharField()
    company_multiplier = serializers.FloatField()
    breakdown = PillarBreakdownItemSerializer(many=True)
    verification_impact = VerificationImpactSerializer()
    strengths = StrengthGapItemSerializer(many=True)
    gaps = StrengthGapItemSerializer(many=True)
    recommendations = RecommendationItemSerializer(many=True)
