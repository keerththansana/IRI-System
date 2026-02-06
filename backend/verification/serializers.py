"""
Serializers for Verification System
"""
from rest_framework import serializers
from .models import VerificationRequest


class VerificationRequestSerializer(serializers.ModelSerializer):
    """Serializer for verification requests."""
    content_type_name = serializers.SerializerMethodField()
    
    class Meta:
        model = VerificationRequest
        fields = [
            'id', 'method', 'status', 'score', 'referral_name', 
            'referral_email', 'evidence_url', 'created_at', 'completed_at',
            'content_type', 'object_id', 'content_type_name'
        ]
        read_only_fields = ['id', 'status', 'score', 'created_at', 'completed_at']
    
    def get_content_type_name(self, obj):
        """Get human-readable content type."""
        return obj.content_type.model if obj.content_type else None


class SelfVerificationRequestSerializer(serializers.Serializer):
    """Request serializer for self-verification (quiz)."""
    item_type = serializers.ChoiceField(choices=['skill', 'experience', 'project'])
    item_id = serializers.IntegerField()


class SelfVerificationResponseSerializer(serializers.Serializer):
    """Response serializer with quiz questions."""
    verification_id = serializers.IntegerField()
    questions = serializers.ListField(child=serializers.DictField())
    expires_in_minutes = serializers.IntegerField()


class QuizSubmissionSerializer(serializers.Serializer):
    """Serializer for quiz answer submission."""
    verification_id = serializers.IntegerField()
    answers = serializers.DictField()  # question_id: answer


class ReferralVerificationRequestSerializer(serializers.Serializer):
    """Request serializer for referral verification."""
    item_type = serializers.ChoiceField(choices=['experience', 'project'])
    item_id = serializers.IntegerField()
    referral_name = serializers.CharField(max_length=200)
    referral_email = serializers.EmailField()
    message = serializers.CharField(required=False, allow_blank=True)


class LinkVerificationRequestSerializer(serializers.Serializer):
    """Request serializer for link-based verification."""
    item_type = serializers.ChoiceField(choices=['project', 'certification'])
    item_id = serializers.IntegerField()
    evidence_url = serializers.URLField()


class VerificationStatusSerializer(serializers.Serializer):
    """Serializer for verification status summary."""
    total_verifications = serializers.IntegerField()
    pending = serializers.IntegerField()
    approved = serializers.IntegerField()
    rejected = serializers.IntegerField()
    by_method = serializers.DictField()
    recent_verifications = VerificationRequestSerializer(many=True)
