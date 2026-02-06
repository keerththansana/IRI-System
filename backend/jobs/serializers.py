from rest_framework import serializers
from .models import JobRole, Pillar, Skill


class JobRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRole
        fields = ['id', 'name', 'description', 'is_active']


class PillarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pillar
        fields = ['id', 'name', 'description', 'default_weight']


class SkillSerializer(serializers.ModelSerializer):
    pillar_name = serializers.CharField(source='pillar.name', read_only=True)
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'pillar', 'pillar_name']
