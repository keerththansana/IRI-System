# IRI System Architecture

## System Overview

The Industry Readiness Index (IRI) System is a comprehensive assessment platform for students to measure their job readiness across different career levels (startup, corporate, leading companies) and IT job roles.

## Frontend Architecture

### Tech Stack
- **Framework**: React 19
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite
- **Router**: React Router v7
- **HTTP Client**: Axios
- **State Management**: React Context API

### Directory Structure
```
frontend/src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Header, Footer, etc)
│   ├── forms/           # Form components
│   ├── profile/         # Profile components
│   └── readiness/       # Readiness dashboard components
├── pages/               # Page-level components
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── ProfileCreation/
│   ├── Dashboard.jsx
│   ├── Verification.jsx
│   └── Results.jsx
├── context/             # React Context
│   ├── AuthContext.jsx
│   └── ProfileContext.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js
│   └── useProfile.js
├── services/            # API service layer
│   ├── api.js           # Axios instance & interceptors
│   ├── auth.js
│   ├── profile.js
│   ├── jobs.js
│   └── readiness.js
├── utils/               # Utility functions
│   ├── validators.js
│   ├── formatters.js
│   └── constants.js
├── styles/              # Global styles
│   ├── theme.css
│   └── variables.css
└── assets/              # Images, icons, SVGs
```

## Backend Architecture

### Tech Stack
- **Framework**: Django 4.2
- **REST API**: Django REST Framework
- **Authentication**: JWT (Simple JWT)
- **Database**: MySQL
- **Environment**: Python Virtual Environment
- **AI Integration**: Gemini API (for skill suggestions)

### Django Apps Structure
```
backend/
├── iri_backend/         # Project settings
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── accounts/            # User authentication & management
│   ├── models.py        # User model
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── profiles/            # Student profile management
│   ├── models.py        # Profile, Education, Experience, Skills, etc
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── jobs/                # Job roles, pillars, skills
│   ├── models.py        # JobRole, Pillar, Skill, JobPillarWeight
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── management/
│       └── commands/
│           └── seed_jobs.py  # Populate 10 IT jobs with pillars
├── readiness/           # Readiness score calculation
│   ├── models.py        # ReadinessScore model
│   ├── serializers.py
│   ├── views.py
│   ├── services.py      # Calculation logic
│   └── urls.py
├── verification/        # 3-step verification system
│   ├── models.py        # Verification, VerificationStep models
│   ├── serializers.py
│   ├── views.py
│   ├── services.py      # Verification logic
│   └── urls.py
├── skills/              # Skill suggestions & matching
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── services.py      # Gemini API integration
│   └── urls.py
├── requirements.txt
├── manage.py
├── .env                 # Environment variables
└── .env.example         # Example env file
```

## Database Schema

### Core Models
- **User**: Django built-in User model
- **StudentProfile**: Student information (name, DOB, etc)
- **Education**: Educational background
- **Experience**: Work experience
- **Project**: Student projects with verification
- **Skill**: Skills with context
- **JobRole**: Available job positions
- **Pillar**: Core competencies (Technical, Cognitive, Behavioral, Domain)
- **JobPillarWeight**: Weight of each pillar for each job
- **ReadinessScore**: Calculated readiness for each job/level
- **Verification**: Verification records (self, referral, link)

## Calculation Engine

### IRI Calculation Formula
```
IRI = Σ(Pillar_Score × Pillar_Weight) for each pillar

Pillar_Score = Σ(Skill_Score × Skill_Weight) for skills in pillar

Where:
- Skill_Score = (0-100) based on evidence (education, project, experience)
- Skill_Weight = relevance to job role
- Pillar_Weight = importance for job role (e.g., Technical: 30%, Cognitive: 25%)
```

### Verification Impact on Score
- **Self-Verification**: Quiz score adds 60% weight to evidence
- **Referral Verification**: Referee confirms adds 30% weight
- **Link Verification**: GitHub/Live project adds 10% weight to credibility

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - Register new user
- `POST /api/auth/login/` - Login
- `GET /api/auth/me/` - Current user info
- `POST /api/auth/logout/` - Logout

### Profile Management
- `GET /api/profiles/me/` - Get user profile
- `PATCH /api/profiles/me/` - Update profile
- `POST /api/profiles/education/` - Add education
- `POST /api/profiles/experience/` - Add experience
- `POST /api/profiles/projects/` - Add project
- `POST /api/profiles/skills/` - Add skill

### Jobs & Pillars
- `GET /api/jobs/` - List all job roles
- `GET /api/jobs/{id}/` - Job role details
- `GET /api/pillars/` - List all pillars
- `GET /api/pillars/{id}/` - Pillar details with skills

### Readiness Calculation
- `GET /api/readiness/` - User's readiness scores
- `POST /api/readiness/calculate/` - Recalculate readiness
- `POST /api/readiness/calculate-detailed/` - Detailed breakdown

### Verification
- `POST /api/verification/self-verify/` - Self-verification quiz
- `POST /api/verification/request-referral/` - Request referral verification
- `GET /api/verification/levels/{job_id}/` - Verification progress

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control (Student, Verifier, Admin)
3. **CORS**: Restricted to frontend domain only
4. **Environment Variables**: Sensitive data in .env
5. **Data Validation**: Server-side validation for all inputs
6. **Rate Limiting**: API endpoint rate limiting
7. **Password Security**: Bcrypt hashing with Django auth

## Deployment Architecture

### Development
- Local MySQL database
- Django dev server
- Vite dev server

### Production
- Docker containers for isolation
- Nginx reverse proxy
- Gunicorn/uWSGI for Django
- PostgreSQL for production database
- AWS/DigitalOcean for hosting
- GitHub Actions for CI/CD

## UI/UX Theme

**Color Palette**: Navy Dark with Blueish-Green accents
- Primary: #00547c (Navy)
- Accent: #009b69 (Teal/Green)
- Background: #f9fafb (Light gray)
- Text: #111827 (Dark gray)

**Design Principles**:
- Professional and trustworthy appearance
- Clean, modern interface
- Accessible and user-friendly
- Mobile-responsive
- Consistent throughout platform
