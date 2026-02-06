from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StudentProfileViewSet,
    EducationViewSet,
    ProjectViewSet,
    ExperienceViewSet,
    CertificationViewSet,
    VolunteeringViewSet,
    ProfileSkillViewSet,
)

router = DefaultRouter()
router.register(r'profiles', StudentProfileViewSet, basename='profile')
router.register(r'education', EducationViewSet, basename='education')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'experience', ExperienceViewSet, basename='experience')
router.register(r'certifications', CertificationViewSet, basename='certification')
router.register(r'volunteering', VolunteeringViewSet, basename='volunteering')
router.register(r'skills', ProfileSkillViewSet, basename='profileskill')

urlpatterns = [
    path('', include(router.urls)),
]
