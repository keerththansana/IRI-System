# IRI System - Development Roadmap

## 🎯 Mission
Build a production-ready Industry Readiness Index System with proper architecture, security, and scalability.

## 📋 Development Phases

### PHASE 1: Environment & Database Setup ✅ **NOW**
**Duration**: 30-45 minutes  
**Outcome**: Development environment ready with seeded data

#### Tasks:
1. ✅ Create architecture documentation
2. ✅ Create database schema documentation
3. ✅ Create environment setup guide
4. **TODO**: Activate Python virtual environment
5. **TODO**: Install backend dependencies
6. **TODO**: Configure MySQL database
7. **TODO**: Run Django migrations
8. **TODO**: Seed 10 job roles + pillars
9. **TODO**: Test backend API

---

### PHASE 2: Django Models Enhancement 
**Duration**: 2-3 hours  
**Outcome**: Complete database schema implemented

#### Current Status:
- ✅ accounts app exists (basic)
- ✅ profiles app basic structure
- ✅ jobs app exists
- ✅ readiness app exists
- ✅ verification app exists
- ❌ skills app needs creation
- ❌ Models need expansion

#### What Needs to be Done:
1. Expand `accounts` - Add profile fields
2. Expand `profiles` - Add all model relationships
   - StudentProfile (main)
   - Education
   - Experience
   - Project
   - Skill
3. Expand `jobs` - Add weightings
   - JobRole
   - Pillar
   - SubPillar
   - Skill
   - JobPillarWeight
   - JobSkillWeight
4. Create `skills` app - Skill suggestion service
5. Expand `readiness` - Add calculation models
   - ReadinessScore
6. Expand `verification` - Add all verification types
   - Verification
   - SelfVerification
   - ReferralVerification
   - LinkVerification

---

### PHASE 3: Django Serializers & Validators
**Duration**: 1.5-2 hours  
**Outcome**: Data serialization and validation logic

#### Tasks:
1. Create serializers for all models
2. Add custom validation logic
3. Implement nested serializers for relationships
4. Add error messages and field-level validation

---

### PHASE 4: Django REST API Views
**Duration**: 2-3 hours  
**Outcome**: RESTful API endpoints

#### Endpoints to Create:

**Authentication** (accounts)
- POST /api/auth/signup/
- POST /api/auth/login/
- GET /api/auth/me/
- POST /api/auth/refresh/
- POST /api/auth/logout/

**Profile Management** (profiles)
- GET /api/profiles/me/
- PATCH /api/profiles/me/
- POST /api/profiles/education/
- GET /api/profiles/education/
- PATCH /api/profiles/education/{id}/
- DELETE /api/profiles/education/{id}/
- POST /api/profiles/experience/
- GET /api/profiles/experience/
- POST /api/profiles/projects/
- GET /api/profiles/projects/
- POST /api/profiles/skills/
- GET /api/profiles/skills/

**Jobs & Pillars** (jobs)
- GET /api/jobs/
- GET /api/jobs/{id}/
- GET /api/pillars/
- GET /api/skills/

**Readiness** (readiness)
- GET /api/readiness/
- POST /api/readiness/calculate/
- GET /api/readiness/{job_id}/detailed/

**Verification** (verification)
- POST /api/verification/self-verify/
- POST /api/verification/request-referral/
- GET /api/verification/{id}/
- POST /api/verification/link-verify/

---

### PHASE 5: Core Calculation Engine
**Duration**: 3-4 hours  
**Outcome**: Accurate readiness score calculation

#### Tasks:
1. Implement scoring formula
2. Create pillar weight calculations
3. Create skill matching logic
4. Implement verification impact on scores
5. Create detailed score breakdown
6. Create cached calculations for performance

#### Formula Implementation:
```python
Overall IRI = Σ(Pillar_Score × Pillar_Weight)

For each Pillar:
    Pillar_Score = Σ(Skill_Score × Skill_Weight)
    
Skill_Score = 
    (Evidence_Score × 0.5) + 
    (Verification_Score × 0.5)

Where:
- Evidence_Score: Based on education, projects, experience
- Verification_Score: Self (0.6) + Referral (0.3) + Link (0.1)
```

---

### PHASE 6: Verification System
**Duration**: 3-4 hours  
**Outcome**: 3-step verification pipeline

#### Tasks:
1. **Self-Verification**:
   - Generate AI questions using Gemini API
   - Score student responses
   - Calculate confidence level

2. **Referral Verification**:
   - Generate unique verification link
   - Send email to referral
   - Process referral confirmation
   - Update score based on feedback

3. **Link Verification**:
   - GitHub API integration (code analysis)
   - Live project analysis
   - Credibility scoring

---

### PHASE 7: AI Integration - Gemini API
**Duration**: 1.5-2 hours  
**Outcome**: AI-powered skill suggestions

#### Tasks:
1. Setup Gemini API client
2. Create skill suggestion service
3. Generate self-verification quiz questions
4. Parse and validate AI responses
5. Rate limiting and caching

---

### PHASE 8: Frontend Page Components
**Duration**: 4-5 hours  
**Outcome**: All pages implemented

#### Pages/Components to Create:

1. **Authentication Pages**
   - Login.jsx (fix existing)
   - Signup.jsx (fix existing)
   - Password Reset (optional)

2. **Profile Creation** (Multi-step)
   - BasicInfo.jsx
   - Education.jsx
   - Experience.jsx
   - Projects.jsx
   - Skills.jsx
   - Review.jsx

3. **Dashboard**
   - Dashboard.jsx (fix existing)
   - ReadinessCard.jsx
   - ScoreBreakdown.jsx

4. **Verification**
   - SelfVerification.jsx
   - ReferralVerification.jsx
   - LinkVerification.jsx
   - VerificationStatus.jsx

5. **Results**
   - JobComparison.jsx
   - CareerPath.jsx
   - ImprovementSuggestions.jsx

---

### PHASE 9: Frontend Component Library
**Duration**: 2-3 hours  
**Outcome**: Reusable UI components

#### Components:
- Header.jsx
- Footer.jsx
- Navigation.jsx
- Button.jsx & variants
- Card.jsx
- Modal.jsx
- Form components (Input, Select, etc)
- ProgressBar.jsx
- Badge.jsx
- Tabs.jsx
- Toast notifications
- Loading skeleton

---

### PHASE 10: State Management & Hooks
**Duration**: 1-2 hours  
**Outcome**: Proper state management

#### Tasks:
1. Enhance AuthContext
2. Create ProfileContext
3. Create custom hooks:
   - useAuth()
   - useProfile()
   - useFetch()
   - useForm()

---

### PHASE 11: Integration & Testing
**Duration**: 2-3 hours  
**Outcome**: End-to-end functionality

#### Testing:
1. Test signup/login flow
2. Test profile creation
3. Test readiness calculation
4. Test verification workflows
5. Test API error handling
6. Test performance

---

### PHASE 12: UI/UX Polish
**Duration**: 2-3 hours  
**Outcome**: Professional, polished interface

#### Tasks:
1. Implement navy dark + teal theme consistently
2. Add loading states
3. Add error handling UI
4. Add success messages
5. Responsive design testing
6. Accessibility audit
7. Performance optimization

---

### PHASE 13: Deployment & Documentation
**Duration**: 2-3 hours  
**Outcome**: Production-ready deployment

#### Tasks:
1. Create Docker setup
2. Configure Nginx
3. Setup CI/CD pipeline
4. Create deployment documentation
5. Setup monitoring
6. Create user documentation

---

## 🚀 Getting Started NOW - First Actions

### Terminal Commands to Run (Copy-Paste):

```bash
# 1. Navigate to backend
cd C:\Users\Keerththansana\Desktop\IRI-System\backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
venv\Scripts\activate

# 4. Upgrade pip
python -m pip install --upgrade pip

# 5. Install dependencies
pip install -r requirements.txt

# 6. Update .env with MySQL password
# Edit backend\.env and set DATABASE_PASSWORD

# 7. Create MySQL database
mysql -u root -p
# Then run SQL commands from SETUP_GUIDE.md

# 8. Run migrations
python manage.py migrate

# 9. Create superuser
python manage.py createsuperuser

# 10. Create job roles (you'll create this file)
python manage.py seed_jobs

# 11. Run backend
python manage.py runserver

# 12. In another terminal, run frontend
cd C:\Users\Keerththansana\Desktop\IRI-System\frontend
npm install
npm run dev -- --port=5173
```

---

## 📊 Project Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Setup | 0.5h | **Starting** |
| 2. Models | 2.5h | Pending |
| 3. Serializers | 2h | Pending |
| 4. API Views | 2.5h | Pending |
| 5. Calculation Engine | 3.5h | Pending |
| 6. Verification System | 3.5h | Pending |
| 7. AI Integration | 1.5h | Pending |
| 8. Frontend Pages | 4.5h | Pending |
| 9. Components | 2.5h | Pending |
| 10. State Management | 1.5h | Pending |
| 11. Integration & Testing | 2.5h | Pending |
| 12. UI/UX Polish | 2.5h | Pending |
| 13. Deployment | 2.5h | Pending |
| **TOTAL** | **~34.5 hours** | |

---

## 🎨 Design System - Navy Theme

### Color Palette
```
Primary: #00547c (Navy Dark)
Accent: #009b69 (Teal/Green)
Light: #f9fafb (Off-white)
Dark: #111827 (Deep gray)
Border: #e5e7eb (Light gray)
Success: #059669 (Green)
Error: #dc2626 (Red)
Warning: #f59e0b (Amber)
Info: #0ea5e9 (Blue)
```

### Typography
- **Display**: 32px, Bold
- **Heading**: 24px, Semibold
- **Subheading**: 18px, Semibold
- **Body**: 16px, Regular
- **Small**: 14px, Regular
- **Label**: 12px, Medium

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

---

## ✅ Quality Checklist

- [ ] Code follows PEP 8 (Python)
- [ ] Code follows ES6+ (JavaScript)
- [ ] All functions have docstrings
- [ ] Error handling implemented
- [ ] Input validation implemented
- [ ] CORS properly configured
- [ ] Database transactions used
- [ ] Performance optimization applied
- [ ] Mobile responsive design
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Security best practices
- [ ] Documentation complete
- [ ] Tests written
- [ ] Deployment tested

---

## 🔑 Key Success Factors

1. **Modular Architecture**: Each feature independent
2. **Clear Separation of Concerns**: Frontend/Backend/Database
3. **Proper Error Handling**: User-friendly error messages
4. **Security First**: JWT, CORS, validation
5. **Performance**: Database indexing, caching
6. **User Experience**: Intuitive, fast, professional
7. **Scalability**: Ready for growth
8. **Documentation**: Clear and comprehensive

---

**Ready to Start? Follow the "Getting Started NOW" section above!**
