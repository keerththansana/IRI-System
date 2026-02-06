from rest_framework import viewsets, permissions
from .models import JobRole, Pillar, Skill
from .serializers import JobRoleSerializer, PillarSerializer, SkillSerializer


class JobRoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobRole.objects.filter(is_active=True)
    serializer_class = JobRoleSerializer
    permission_classes = [permissions.AllowAny]


class PillarViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Pillar.objects.all()
    serializer_class = PillarSerializer
    permission_classes = [permissions.AllowAny]


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
