from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobRoleViewSet, PillarViewSet, SkillViewSet

router = DefaultRouter()
router.register(r'jobs', JobRoleViewSet, basename='job')
router.register(r'pillars', PillarViewSet, basename='pillar')
router.register(r'skills', SkillViewSet, basename='skill')

urlpatterns = [
    path('', include(router.urls)),
]
