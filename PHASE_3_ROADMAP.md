# Phase 3: Profile Creation UI & Verification System Roadmap

## Overview
Phase 3 focuses on building the user-facing profile creation interface and implementing the verification system that feeds data into the readiness calculation engine created in Phase 2.

## Phase 3 Objectives (13 Tasks)

### Part A: Frontend Profile Creation System (Tasks 1-5)

#### Task 1: Create Multi-Step Profile Form Component
**Timeline:** 2-3 hours

**Goal:** Build a LinkedIn-style multi-step form with data persistence

**Steps:**
1. Create `frontend/src/components/ProfileForm/ProfileFormContainer.jsx`
   - State management for all 7 steps
   - Auto-save to localStorage
   - Progress tracking

2. Create individual step components:
   - `Step1_BasicInfo.jsx` (Full name, headline, summary)
   - `Step2_Education.jsx` (School, degree, GPA, graduation date)
   - `Step3_Experience.jsx` (Company, role, tenure, description)
   - `Step4_Projects.jsx` (Title, tech stack, GitHub, live link)
   - `Step5_Skills.jsx` (Skill name, proficiency, verification type)
   - `Step6_Certifications.jsx` (Cert name, issuer, expiry)
   - `Step7_Review.jsx` (Show all data, edit options)

3. Add navigation buttons (Previous, Next, Save, Submit)

4. Add validation:
   - Required field checking
   - Email format validation
   - URL validation for GitHub/portfolio links
   - Date range validation (end > start)

**Files to Create:**
```
frontend/src/components/ProfileForm/
├── ProfileFormContainer.jsx
├── Step1_BasicInfo.jsx
├── Step2_Education.jsx
├── Step3_Experience.jsx
├── Step4_Projects.jsx
├── Step5_Skills.jsx
├── Step6_Certifications.jsx
├── Step7_Review.jsx
└── ProfileForm.module.css
```

---

#### Task 2: Implement Gemini API Skill Suggestions
**Timeline:** 1-2 hours

**Goal:** Integrate Gemini API for real-time skill recommendations

**Steps:**
1. Create `frontend/src/services/geminiService.js`
   ```javascript
   async function suggestSkills(experience_summary, projects_description) {
     // Calls Gemini API to suggest skills based on user data
     // Returns array of skill suggestions with categories
   }
   ```

2. In `Step5_Skills.jsx`:
   - Add "Get Suggestions" button
   - Show loading spinner while fetching
   - Display suggested skills with checkboxes
   - Let user add any suggestions to their skills list

3. Handle Gemini API calls:
   - API Key: `AIzaSyDO7IWDbp482jpmoEjxJIDKMH2vUiKZMtE`
   - Rate limit to 1 request per 5 seconds
   - Cache results for 1 hour

**Gemini Prompt Template:**
```
"Based on this professional experience and projects, suggest 5-10 technical skills that would be valuable for an IT professional. 

Experience: [user's experiences]
Projects: [user's projects]

Return as JSON array with format:
[
  {"name": "React", "category": "Framework", "proficiency": "Intermediate"},
  ...
]
"
```

---

#### Task 3: Create Profile API Integration Layer
**Timeline:** 1-2 hours

**Goal:** Build API service layer for profile CRUD operations

**Steps:**
1. Create `frontend/src/services/profileService.js` with methods:
   ```javascript
   async function createProfile(profileData)
   async function getProfile()
   async function updateProfile(profileData)
   async function addEducation(education)
   async function addExperience(experience)
   async function addProject(project)
   async function addSkill(skill)
   async function addCertification(certification)
   async function submitProfile()  // Triggers readiness calculation
   ```

2. Handle API responses:
   - Error handling with user-friendly messages
   - Retry logic for failed requests
   - Request timeout handling (30 seconds)

3. Add loading states:
   - Show spinners during API calls
   - Disable buttons while saving
   - Display success/error toasts

---

#### Task 4: Update Profile Page Routing
**Timeline:** 30 minutes

**Goal:** Implement profile creation flow in the app

**Steps:**
1. Update `frontend/src/pages/Profile.jsx`:
   - Check if profile exists
   - If no profile: Show ProfileForm (edit mode) with all 7 steps
   - If profile exists: Show profile display with edit buttons

2. Add route in `frontend/src/App.jsx`:
   ```jsx
   <Route path="/profile" element={<Profile />} />
   <Route path="/profile/edit" element={<Profile editMode={true} />} />
   ```

3. Add profile navigation:
   - Add link in dashboard/navbar
   - Show profile completion percentage
   - Add badge when profile is complete

---

#### Task 5: Add Real-Time Readiness Preview
**Timeline:** 1 hour

**Goal:** Show IRI score preview as user fills profile

**Steps:**
1. In `Step7_Review.jsx`:
   - Add button "Preview Readiness Scores"
   - Call backend `/api/readiness/all_jobs/` endpoint
   - Show top 3 matching job roles with scores
   - Display company level selector

2. Create `frontend/src/components/ReadinessPreview.jsx`:
   - Show IRI scores for all jobs
   - Color code: Green (70+), Yellow (50-69), Red (<50)
   - Show pillar breakdown for selected job
   - Display strengths and gaps

3. Add animations:
   - Fade in scores when loaded
   - Progress bars for each score
   - Highlight best fit role

---

### Part B: Verification System Implementation (Tasks 6-10)

#### Task 6: Create Self-Verification (AI Quiz) System
**Timeline:** 2-3 hours

**Goal:** Build AI quiz-based skill verification

**Steps:**
1. Create `backend/readiness/verification_service.py`:
   ```python
   class SelfVerificationService:
       async def generate_quiz(skill_name, difficulty='medium'):
           # Calls Gemini to generate 3 technical quiz questions
           
       async def evaluate_answers(skill_name, questions, answers):
           # Grades answers, returns score 0-100
   ```

2. Gemini Prompt for Quiz Generation:
   ```
   "Generate 3 technical interview questions for someone claiming expertise in [SKILL].
   Difficulty: [DIFFICULTY]
   
   Return as JSON:
   {
     "questions": [
       {"id": 1, "text": "...", "type": "multiple_choice", "options": ["A", "B", "C", "D"]},
       ...
     ]
   }"
   ```

3. Create API endpoint:
   ```
   POST /api/verification/self-verify/
   {
     "item_type": "skill",  // skill, project, certification
     "item_id": 5,
     "skill_name": "Python"
   }
   
   Response: {
     "verification_request_id": 14,
     "questions": [...]
   }
   ```

4. Create submission endpoint:
   ```
   POST /api/verification/submit-quiz/
   {
     "verification_request_id": 14,
     "answers": [
       {"question_id": 1, "answer": "B"},
       ...
     ]
   }
   
   Response: {
     "score": 85,
     "passed": true,
     "verification_status": "approved"
   }
   ```

#### Task 7: Create Referral Verification System
**Timeline:** 1-2 hours

**Goal:** Build referral request and email verification

**Steps:**
1. Create `backend/accounts/email_service.py`:
   ```python
   async def send_referral_request_email(referrer_email, name, skill/project, unique_token):
       # Sends email with verification link
       # Link: http://localhost:5173/verify/referral/{token}
   ```

2. Create API endpoints:
   ```
   POST /api/verification/request-referral/
   {
     "item_type": "skill",
     "item_id": 5,
     "referrer_email": "john@company.com",
     "referrer_name": "John Doe"
   }
   
   Response: {
     "verification_request_id": 15,
     "status": "pending",
     "referral_link": "http://..."
   }
   
   GET /api/verification/verify/{token}/
   # Shows form for referrer to verify
   
   POST /api/verification/submit-referral/
   {
     "token": "abc123xyz...",
     "rating": 4,
     "comments": "Jane is excellent at Python..."
   }
   
   Response: {
     "verification_status": "approved",
     "referrer_score": 85
   }
   ```

3. Email template (plain text):
   ```
   Hi [Referrer Name],
   
   [User Name] has requested that you verify their [Skill/Project].
   
   Click here to verify: [Link]
   
   This link expires in 7 days.
   ```

#### Task 8: Create Link Verification System
**Timeline:** 2 hours

**Goal:** Analyze GitHub repos and portfolio links for credibility

**Steps:**
1. Create `backend/readiness/github_analyzer.py`:
   ```python
   class GitHubAnalyzer:
       async def analyze_repository(github_url):
           # Parse owner/repo from URL
           # Fetch via GitHub API (or public stats if no API key)
           # Analyze:
           - Stars count
           - Forks count
           - Recent commits (activity)
           - Languages used
           - README quality
           - License presence
           
           # Return credibility_score: 0-100
   ```

2. Create API endpoint:
   ```
   POST /api/verification/verify-link/
   {
     "item_type": "project",
     "item_id": 8,
     "link_url": "https://github.com/user/awesome-app"
   }
   
   Response: {
     "verification_request_id": 16,
     "credibility_score": 78,
     "analysis": {
       "stars": 45,
       "forks": 12,
       "recent_commits": true,
       "languages": ["Python", "JavaScript"],
       "has_readme": true,
       "has_license": true
     },
     "status": "approved"
   }
   ```

#### Task 9: Create Verification UI Components
**Timeline:** 1-2 hours

**Goal:** Build frontend verification interfaces

**Steps:**
1. Create `frontend/src/components/Verification/`:
   ```
   ├── SelfVerificationQuiz.jsx
   │   ├── Question display (text/multiple choice)
   │   ├── Submit answers button
   │   └── Results display (score, pass/fail)
   │
   ├── ReferralVerificationForm.jsx
   │   ├── Email input for referrer
   │   ├── Submit button
   │   └── Success message with shareable link
   │
   ├── LinkVerificationDisplay.jsx
   │   ├── Show credibility score with icon
   │   ├── Breakdown of analysis
   │   └── Approve/retry buttons
   │
   └── VerificationButtons.jsx
       ├── Quick action buttons for each item
       └── Verification status badges
   ```

2. Add verification status badges:
   - Green checkmark: Verified
   - Orange pending: Pending verification
   - X mark: Failed/Not verified
   - Gray: Unverified

3. Show on profile items:
   - Each skill shows verification badge
   - Each project shows verification status
   - Each certification shows expiry date

#### Task 10: Add Verification Management Page
**Timeline:** 1 hour

**Goal:** Dashboard for managing verifications

**Steps:**
1. Create `frontend/src/pages/Verifications.jsx`:
   - Show all pending verifications (awaiting referral)
   - Show all completed verifications
   - Show verification history with timestamps
   - Option to re-request verifications
   - Shows impact on readiness score

2. Add to main dashboard:
   - Verification progress indicator
   - Number of verified items
   - Impact on IRI score

---

### Part C: Integration & Testing (Tasks 11-13)

#### Task 11: Create E2E Profile Creation Test Flow
**Timeline:** 1.5 hours

**Goal:** Test complete profile creation → readiness calculation flow

**Steps:**
1. Manual test checklist:
   - [ ] Fill all 7 profile steps
   - [ ] Auto-save between steps
   - [ ] Get skill suggestions from Gemini
   - [ ] Submit complete profile
   - [ ] Verify profile saved to backend
   - [ ] View profile in database
   - [ ] Request readiness calculation
   - [ ] Verify calculation uses correct weights
   - [ ] Check strengths/gaps are accurate
   - [ ] View readiness result on frontend

2. Create test user profile:
   ```json
   {
     "basic_info": {
       "full_name": "Test User",
       "headline": "Full Stack Developer"
     },
     "experience": {
       "years": 5,
       "companies": ["Tech Corp", "Startup LLC"]
     },
     "projects": [
       {"title": "E-Commerce App", "stars": 120},
       {"title": "Data Dashboard", "stars": 45}
     ],
     "skills": [
       {"name": "Python", "verified": true},
       {"name": "React", "verified": false}
     ]
   }
   ```

#### Task 12: Performance Optimization
**Timeline:** 1 hour

**Goal:** Optimize calculation and API response times

**Steps:**
1. Backend optimization:
   - Cache pillar scores for 1 hour
   - Index database queries for skills/experience
   - Batch load related objects
   - Use select_related() and prefetch_related()

2. Frontend optimization:
   - Code split profile form steps
   - Lazy load ReadinessPreview component
   - Debounce auto-save (2 second delay)
   - Cache API responses

3. Performance targets:
   - Profile form load: <1 second
   - Step navigation: <500ms
   - Readiness calculation: <3 seconds
   - API response: <500ms

#### Task 13: Documentation & Deployment Prep
**Timeline:** 1 hour

**Goal:** Document Phase 3 and prepare for production

**Steps:**
1. Create `PHASE_3_COMPLETION.md`:
   - Feature summary
   - API endpoints reference
   - User flow diagrams
   - Testing checklist results

2. Create `PROFILE_CREATION_GUIDE.md`:
   - Step-by-step user guide
   - Screenshot annotations
   - Tips for better readiness scores
   - Verification process explanation

3. Update main `ARCHITECTURE.md`:
   - Add profile creation workflow
   - Add verification system flow
   - Update API endpoints section

4. Create deployment checklist:
   - Environment variables needed
   - Database migrations
   - Email service configuration
   - Gemini API key setup
   - GitHub API key setup (optional)

---

## Dependency Graph

```
Task 1 (Profile Form)
    ↓
Task 3 (API Layer) ← Task 2 (Gemini Suggestions)
    ↓
Task 4 (Routing)
    ↓
Task 5 (Readiness Preview)
    
Task 6 (Self-Verification)
    ↓
Task 9 (Verification UI) ← Task 7 (Referral) ← Task 8 (Link Analysis)
    ↓
Task 10 (Verification Dashboard)
    
Tasks 1-10 → Task 11 (E2E Testing)
              → Task 12 (Performance)
              → Task 13 (Documentation)
```

## Phase 3 Success Criteria

- ✅ Multi-step profile form is fully functional
- ✅ All data saves to database correctly
- ✅ Gemini API skill suggestions work
- ✅ All 3 verification methods implemented
- ✅ Readiness scores calculate correctly with profile data
- ✅ Verification impact on scores is accurate
- ✅ Complete E2E test passes
- ✅ Performance targets met
- ✅ Documentation complete
- ✅ Ready for user beta testing

## Time Estimate: 16-20 hours

**Breakdown:**
- Part A (Tasks 1-5): 6-8 hours
- Part B (Tasks 6-10): 8-10 hours  
- Part C (Tasks 11-13): 2-2.5 hours

**Total Phase 3: 16-20.5 hours**

## Next Steps

1. Start with Task 1: Create ProfileFormContainer.jsx
2. Build the 7 step components sequentially
3. Integrate with backend API (Task 3) in parallel
4. Then add verification system (Tasks 6-10)
5. Comprehensive testing (Task 11-13)

Ready to begin Phase 3?
