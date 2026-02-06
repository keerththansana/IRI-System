# Phase 3 Backend - Implementation Guide

## Overview
This guide provides step-by-step instructions to create the backend API endpoints needed to support the frontend profile creation UI that was just completed.

---

## What Frontend Expects

### 1. **Profile Creation Endpoint**
**Endpoint**: `POST /api/profiles/create-profile/`

**Request Body**:
```json
{
  "basic_info": {
    "full_name": "string (required)",
    "date_of_birth": "YYYY-MM-DD (optional)",
    "location": "string (optional)",
    "headline": "string (optional)",
    "summary": "text (optional)"
  },
  "educations": [
    {
      "institution": "string",
      "level": "string (Primary, Secondary A/L, Secondary O/L, Diploma, Bachelor, Postgraduate)",
      "field_of_study": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or null",
      "grade_gpa": "string",
      "description": "text",
      "currently_studying": "boolean"
    }
  ],
  "experiences": [
    {
      "company": "string",
      "job_title": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or null",
      "description": "text",
      "currently_working": "boolean",
      "referral_name": "string (optional)",
      "referral_email": "email (optional)"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "text",
      "technologies": "string (comma-separated)",
      "github_link": "url (optional)",
      "live_url": "url (optional)",
      "your_contribution": "text",
      "start_date": "YYYY-MM (optional)",
      "end_date": "YYYY-MM (optional)"
    }
  ],
  "skills": [
    {
      "name": "string",
      "proficiency": "integer (1-5)"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issue_date": "YYYY-MM (optional)",
      "expiry_date": "YYYY-MM (optional)",
      "credential_url": "url (optional)",
      "does_not_expire": "boolean"
    }
  ],
  "volunteering": []
}
```

**Expected Response**:
```json
{
  "profile_id": 123,
  "message": "Profile created successfully",
  "readiness_scores": {
    "startup_score": 75.5,
    "corporate_score": 68.2,
    "leading_score": 45.8
  }
}
```

---

## Implementation Steps

### Step 1: Update StudentProfile Model

**File**: `backend/profiles/models.py`

**Add fields** (if not already present):
```python
from django.db import models
from django.contrib.auth.models import User

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    headline = models.CharField(max_length=255, blank=True)
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.user.username}"

class Education(models.Model):
    LEVEL_CHOICES = [
        ('primary', 'Primary'),
        ('secondary_al', 'Secondary A/L'),
        ('secondary_ol', 'Secondary O/L'),
        ('diploma', 'Diploma'),
        ('bachelor', 'Bachelor'),
        ('postgraduate', 'Postgraduate')
    ]
    
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='educations')
    institution = models.CharField(max_length=255)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    field_of_study = models.CharField(max_length=255, blank=True)
    start_date = models.CharField(max_length=10, blank=True)  # YYYY-MM
    end_date = models.CharField(max_length=10, blank=True, null=True)
    grade_gpa = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    currently_studying = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.institution} - {self.level}"

class Experience(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255)
    start_date = models.CharField(max_length=10, blank=True)  # YYYY-MM
    end_date = models.CharField(max_length=10, blank=True, null=True)
    description = models.TextField(blank=True)
    currently_working = models.BooleanField(default=False)
    referral_name = models.CharField(max_length=255, blank=True)
    referral_email = models.EmailField(blank=True)
    verification_requested = models.BooleanField(default=False)
    verification_status = models.CharField(max_length=50, default='unverified')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_title} at {self.company}"

class Project(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField()
    technologies = models.TextField(blank=True)  # Comma-separated
    github_link = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    your_contribution = models.TextField(blank=True)
    start_date = models.CharField(max_length=10, blank=True)  # YYYY-MM
    end_date = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Skill(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    proficiency = models.IntegerField(default=3)  # 1-5
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (Level {self.proficiency})"

class Certification(models.Model):
    profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255)
    issue_date = models.CharField(max_length=10, blank=True)  # YYYY-MM
    expiry_date = models.CharField(max_length=10, blank=True, null=True)
    credential_url = models.URLField(blank=True)
    does_not_expire = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.issuer})"
```

**Run Migrations**:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

### Step 2: Create Serializers

**File**: `backend/profiles/serializers.py`

```python
from rest_framework import serializers
from .models import StudentProfile, Education, Experience, Project, Skill, Certification

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['institution', 'level', 'field_of_study', 'start_date', 'end_date', 
                  'grade_gpa', 'description', 'currently_studying']

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['company', 'job_title', 'start_date', 'end_date', 'description', 
                  'currently_working', 'referral_name', 'referral_email']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['title', 'description', 'technologies', 'github_link', 'live_url', 
                  'your_contribution', 'start_date', 'end_date']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['name', 'proficiency']

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['name', 'issuer', 'issue_date', 'expiry_date', 'credential_url', 
                  'does_not_expire']

class ProfileCreateSerializer(serializers.Serializer):
    basic_info = serializers.DictField()
    educations = EducationSerializer(many=True, required=False)
    experiences = ExperienceSerializer(many=True, required=False)
    projects = ProjectSerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)
    certifications = CertificationSerializer(many=True, required=False)
    volunteering = serializers.ListField(required=False)

    def create(self, validated_data):
        user = self.context['request'].user
        basic_info = validated_data.get('basic_info', {})
        
        # Create StudentProfile
        profile, created = StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': basic_info.get('full_name', ''),
                'date_of_birth': basic_info.get('date_of_birth'),
                'location': basic_info.get('location', ''),
                'headline': basic_info.get('headline', ''),
                'summary': basic_info.get('summary', '')
            }
        )
        
        # If profile exists, update it
        if not created:
            profile.full_name = basic_info.get('full_name', profile.full_name)
            profile.date_of_birth = basic_info.get('date_of_birth', profile.date_of_birth)
            profile.location = basic_info.get('location', profile.location)
            profile.headline = basic_info.get('headline', profile.headline)
            profile.summary = basic_info.get('summary', profile.summary)
            profile.save()
        
        # Clear existing related data (if updating)
        profile.educations.all().delete()
        profile.experiences.all().delete()
        profile.projects.all().delete()
        profile.skills.all().delete()
        profile.certifications.all().delete()
        
        # Create Education entries
        for edu_data in validated_data.get('educations', []):
            Education.objects.create(profile=profile, **edu_data)
        
        # Create Experience entries
        for exp_data in validated_data.get('experiences', []):
            Experience.objects.create(profile=profile, **exp_data)
        
        # Create Project entries
        for proj_data in validated_data.get('projects', []):
            Project.objects.create(profile=profile, **proj_data)
        
        # Create Skill entries
        for skill_data in validated_data.get('skills', []):
            Skill.objects.create(profile=profile, **skill_data)
        
        # Create Certification entries
        for cert_data in validated_data.get('certifications', []):
            Certification.objects.create(profile=profile, **cert_data)
        
        return profile

class StudentProfileSerializer(serializers.ModelSerializer):
    educations = EducationSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'full_name', 'date_of_birth', 'location', 'headline', 'summary',
                  'educations', 'experiences', 'projects', 'skills', 'certifications']
```

---

### Step 3: Create View

**File**: `backend/profiles/views.py`

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import ProfileCreateSerializer, StudentProfileSerializer
from .models import StudentProfile
from readiness.services import ReadinessCalculator

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_profile(request):
    """
    Create or update student profile with all data
    """
    serializer = ProfileCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        profile = serializer.save()
        
        # Calculate readiness scores
        calculator = ReadinessCalculator(profile)
        scores = calculator.calculate_all_scores()
        
        return Response({
            'profile_id': profile.id,
            'message': 'Profile created successfully',
            'readiness_scores': {
                'startup_score': scores.get('startup', {}).get('total_score', 0),
                'corporate_score': scores.get('corporate', {}).get('total_score', 0),
                'leading_score': scores.get('leading', {}).get('total_score', 0)
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    """
    Retrieve authenticated user's profile
    """
    try:
        profile = StudentProfile.objects.get(user=request.user)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)
    except StudentProfile.DoesNotExist:
        return Response({'detail': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
```

---

### Step 4: Add URL Routes

**File**: `backend/profiles/urls.py`

```python
from django.urls import path
from . import views

urlpatterns = [
    path('create-profile/', views.create_profile, name='create-profile'),
    path('my-profile/', views.get_my_profile, name='my-profile'),
]
```

**File**: `backend/iri_backend/urls.py` (Add to existing)

```python
urlpatterns = [
    # ... existing patterns ...
    path('api/profiles/', include('profiles.urls')),
]
```

---

### Step 5: Test with Postman/curl

**Create Profile Request**:
```bash
curl -X POST http://localhost:8000/api/profiles/create-profile/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "basic_info": {
      "full_name": "John Doe",
      "date_of_birth": "2000-05-15",
      "location": "Colombo, Sri Lanka",
      "headline": "Full Stack Developer",
      "summary": "Passionate about building scalable web applications"
    },
    "educations": [
      {
        "institution": "University of Colombo",
        "level": "bachelor",
        "field_of_study": "Computer Science",
        "start_date": "2018-09",
        "end_date": "2022-06",
        "grade_gpa": "3.8",
        "description": "Focused on software engineering",
        "currently_studying": false
      }
    ],
    "skills": [
      {"name": "Python", "proficiency": 4},
      {"name": "React", "proficiency": 5},
      {"name": "Django", "proficiency": 4}
    ]
  }'
```

---

## Gemini AI Integration (Optional for Phase 3)

### Skill Suggestions Endpoint

**File**: `backend/profiles/views.py` (add)

```python
import google.generativeai as genai
from django.conf import settings

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_skill_suggestions(request):
    """
    Get AI-generated skill suggestions based on job role
    """
    job_role = request.query_params.get('job_role', 'software engineer')
    
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        List the top 10 most important skills for a {job_role} position.
        Return ONLY a comma-separated list of skills, no explanations.
        Example: Python, React, Docker, AWS, Problem Solving
        """
        
        response = model.generate_content(prompt)
        skills = [s.strip() for s in response.text.split(',')]
        
        return Response({'suggestions': skills[:10]})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

**Add to settings.py**:
```python
GEMINI_API_KEY = 'AIzaSyDO7IWDbp482jpmoEjxJIDKMH2vUiKZMtE'
```

**Add to urls.py**:
```python
path('skill-suggestions/', views.get_skill_suggestions, name='skill-suggestions'),
```

**Install dependency**:
```bash
pip install google-generativeai
pip freeze > requirements.txt
```

---

## Verification System (Phase 3.5)

### Send Referral Verification Email

**File**: `backend/verification/views.py`

```python
from django.core.mail import send_mail
from django.conf import settings

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_verification(request):
    """
    Send verification email to referral contact
    """
    item_id = request.data.get('item_id')
    item_type = request.data.get('item_type')  # 'experience', 'education', 'project'
    contact_email = request.data.get('contact_email')
    
    # Generate verification link
    verification_token = generate_unique_token()
    verification_link = f"{settings.FRONTEND_URL}/verify/{verification_token}"
    
    # Send email
    send_mail(
        subject=f"Verification Request - {request.user.username}",
        message=f"""
        Hello,
        
        {request.user.username} has listed you as a reference.
        Please verify their information by clicking the link below:
        
        {verification_link}
        
        Thank you!
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[contact_email],
        fail_silently=False,
    )
    
    return Response({'message': 'Verification email sent successfully'})
```

---

## Testing Checklist

### Backend Tests
- [ ] Profile creation with all fields
- [ ] Profile creation with minimal fields (only name)
- [ ] Profile update (change existing data)
- [ ] Retrieve profile after creation
- [ ] Readiness score calculation returns valid scores
- [ ] Authentication required (401 without token)
- [ ] Invalid data returns 400
- [ ] Nested records (educations, skills, etc.) saved correctly

### Integration Tests (Frontend + Backend)
- [ ] Fill form in frontend → submit → profile created in database
- [ ] Auto-save localStorage → reload page → data restored
- [ ] Validation errors displayed correctly
- [ ] Success message shown after submission
- [ ] Readiness preview displays calculated scores
- [ ] Skill suggestions (if AI integrated)

---

## Database Verification

After creating a profile, verify in Django admin or shell:

```python
python manage.py shell

from profiles.models import StudentProfile, Education, Experience, Skill

# Check profile
profile = StudentProfile.objects.first()
print(profile.full_name)

# Check related records
print(profile.educations.count())
print(profile.experiences.count())
print(profile.skills.count())

# Verify data
for edu in profile.educations.all():
    print(f"{edu.institution} - {edu.level}")
```

---

## Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Update `settings.py`
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
]
```

### Issue 2: Authentication Token Not Sent
**Solution**: Frontend ensures token in request headers
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Issue 3: Date Format Mismatch
**Solution**: Frontend sends YYYY-MM-DD, backend expects DateField

### Issue 4: Nested Data Not Saving
**Solution**: Check serializer `create` method properly handles nested data

---

## Performance Optimization

### Batch Creation
Use `bulk_create` for better performance:
```python
education_objects = [Education(profile=profile, **edu) for edu in educations_data]
Education.objects.bulk_create(education_objects)
```

### Select Related
When retrieving profile:
```python
profile = StudentProfile.objects.select_related('user').prefetch_related(
    'educations', 'experiences', 'projects', 'skills', 'certifications'
).get(user=request.user)
```

---

## Next Steps After Backend Complete

1. Test end-to-end flow (form → API → database)
2. Implement Gemini AI skill suggestions
3. Build verification system (email + link)
4. Add readiness preview to dashboard
5. Implement profile editing (PATCH endpoint)
6. Add profile sharing/export functionality

---

**Status**: Backend implementation guide complete  
**ETA**: 2-3 hours to implement and test all endpoints  
**Priority**: Create `/api/profiles/create-profile/` first  

---

*Generated: Phase 3 Backend Implementation Guide*
