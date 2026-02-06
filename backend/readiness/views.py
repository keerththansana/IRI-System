from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.cache import cache

from profiles.models import StudentProfile
from jobs.models import JobRole
from .models import ReadinessScore
from .serializers import (
    ReadinessScoreSerializer,
    ReadinessCalculationRequestSerializer,
    ReadinessResultSerializer
)
from .calculation_engine import ReadinessCalculator


class ReadinessViewSet(viewsets.ViewSet):
    """
    API endpoints for readiness assessment and score calculation.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """
        Calculate readiness score for a specific job role and company level.
        
        POST /api/readiness/calculate/
        {
            "job_role_id": 1,
            "company_level": "startup"  // optional: startup, corporate, leading
        }
        """
        serializer = ReadinessCalculationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        job_role_id = serializer.validated_data.get('job_role_id')
        company_level = serializer.validated_data.get('company_level', 'startup')
        
        # Get job role
        try:
            job_role = JobRole.objects.get(id=job_role_id, is_active=True)
        except JobRole.DoesNotExist:
            return Response(
                {'error': f'Job role {job_role_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get user profile
        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found. Please create profile first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculate readiness
        calculator = ReadinessCalculator(request.user)
        result = calculator.calculate_iri(job_role, company_level)

        if isinstance(result.get('breakdown'), dict):
            result['breakdown'] = list(result['breakdown'].values())
        
        # Cache result for 1 hour
        cache_key = f"readiness_{request.user.id}_{job_role_id}_{company_level}"
        cache.set(cache_key, result, 3600)
        
        # Serialize and return result
        response_serializer = ReadinessResultSerializer(result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def all_jobs(self, request):
        """
        Calculate readiness for all job roles.
        
        GET /api/readiness/all_jobs/?company_level=startup
        """
        company_level = request.query_params.get('company_level', 'startup')
        
        if company_level not in ['startup', 'corporate', 'leading']:
            return Response(
                {'error': 'Invalid company_level'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculate for all active job roles
        job_roles = JobRole.objects.filter(is_active=True)
        results = {}
        calculator = ReadinessCalculator(request.user)
        
        for job_role in job_roles:
            result = calculator.calculate_iri(job_role, company_level)
            results[job_role.name] = {
                'id': job_role.id,
                'iri_score': result.get('iri_score', 0),
                'base_score': result.get('base_score', 0)
            }
        
        # Sort by IRI score descending
        sorted_results = sorted(
            results.items(),
            key=lambda x: x[1]['iri_score'],
            reverse=True
        )
        
        return Response({
            'company_level': company_level,
            'results': dict(sorted_results)
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get readiness summary for user across all job roles.
        
        GET /api/readiness/summary/
        """
        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        calculator = ReadinessCalculator(request.user)
        job_roles = JobRole.objects.filter(is_active=True)
        
        summary_data = {
            'overall_average': 0,
            'best_fit_role': None,
            'top_3_roles': [],
            'company_levels': {}
        }
        
        for company_level in ['startup', 'corporate', 'leading']:
            scores = []
            level_results = []
            
            for job_role in job_roles:
                result = calculator.calculate_iri(job_role, company_level)
                score = result.get('iri_score', 0)
                scores.append(score)
                level_results.append({
                    'role': job_role.name,
                    'score': score,
                    'id': job_role.id
                })
            
            # Sort and get top 3
            level_results.sort(key=lambda x: x['score'], reverse=True)
            top_3 = level_results[:3]
            
            avg_score = sum(scores) / len(scores) if scores else 0
            
            summary_data['company_levels'][company_level] = {
                'average_score': avg_score,
                'top_3': top_3
            }
        
        # Calculate overall average across all company levels
        all_scores = [
            v['average_score']
            for v in summary_data['company_levels'].values()
        ]
        summary_data['overall_average'] = sum(all_scores) / len(all_scores) if all_scores else 0
        
        # Find best fit role
        startup_top = summary_data['company_levels']['startup']['top_3']
        if startup_top:
            summary_data['best_fit_role'] = startup_top[0]
        
        return Response(summary_data, status=status.HTTP_200_OK)


class ReadinessScoreViewSet(viewsets.ReadOnlyModelViewSet):
    """Legacy viewset for persisted readiness scores."""
    serializer_class = ReadinessScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadinessScore.objects.filter(
            profile__user=self.request.user
        ).select_related('job_role').order_by('-updated_at')
