from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReadinessViewSet, ReadinessScoreViewSet

router = DefaultRouter()
router.register(r'readiness', ReadinessViewSet, basename='readiness')
router.register(r'scores', ReadinessScoreViewSet, basename='scores')

urlpatterns = [
    path('', include(router.urls)),
]
