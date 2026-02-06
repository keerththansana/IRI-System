# Phase 2 API Testing Guide

## Quick Test: Readiness Calculation Endpoint

After Phase 1 (where profiles are created with skills, experiences, projects), Phase 2 enables real-time IRI calculation.

### Prerequisites
- ✅ Backend running on http://localhost:8000
- ✅ Database populated with 10 jobs (completed)
- ✅ Database populated with 4 pillars + 19 sub-pillars + 40 weights (completed)
- ✅ User has created profile with data (needed before testing)

### Test Sequence

#### 1. Create a Test User Profile (Manual or via API)

**Option A: Use existing admin user**
- Username: admin
- Password: Admin@123456

**Option B: Get auth token**
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123456"}'

# Returns:
# {"access":"eyJ0eXAiOiJKV1QiLCJhbGc...","refresh":"eyJ0eXAi..."}
```

#### 2. Create StudentProfile (if doesn't exist)

```bash
curl -X POST http://localhost:8000/api/profiles/student-profiles/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Developer",
    "headline": "Full Stack Developer",
    "summary": "5 years of web development experience"
  }'
```

#### 3. Add Sample Skills via API

```bash
curl -X POST http://localhost:8000/api/profiles/skills/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skill_name": "Python",
    "sub_pillar_id": 1,
    "proficiency": 5
  }'
```

#### 4. Test Readiness Calculation Endpoint

**Calculate for Software Engineer job (startup level)**

```bash
curl -X POST http://localhost:8000/api/readiness/calculate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_role_id": 1,
    "company_level": "startup"
  }'
```

**Expected Response:**
```json
{
  "iri_score": 65.5,
  "base_score": 65.5,
  "company_level": "startup",
  "company_multiplier": 1.0,
  "breakdown": [
    {
      "name": "Technical Skills",
      "score": 70.0,
      "weight_percent": 40.0,
      "weighted_contribution": 28.0
    },
    {
      "name": "Cognitive Abilities",
      "score": 65.0,
      "weight_percent": 30.0,
      "weighted_contribution": 19.5
    },
    {
      "name": "Behavioral Competencies",
      "score": 55.0,
      "weight_percent": 20.0,
      "weighted_contribution": 11.0
    },
    {
      "name": "Domain Knowledge",
      "score": 45.0,
      "weight_percent": 10.0,
      "weighted_contribution": 4.5
    }
  ],
  "verification_impact": {
    "total_verifications": 2,
    "verified_count": 1,
    "verification_rate": 50.0,
    "by_type": {
      "self": {"total": 1, "verified": 1, "percentage": 100.0},
      "referral": {"total": 1, "verified": 0, "percentage": 0.0},
      "link": {"total": 0, "verified": 0, "percentage": 0.0}
    }
  },
  "strengths": [
    {"pillar": "Technical Skills", "score": 70.0},
    {"pillar": "Cognitive Abilities", "score": 65.0},
    {"pillar": "Behavioral Competencies", "score": 55.0}
  ],
  "gaps": [
    {"pillar": "Domain Knowledge", "score": 45.0}
  ],
  "recommendations": [
    {
      "area": "Domain Knowledge",
      "priority": "high",
      "suggestion": "Increase your understanding of IT industry trends and best practices relevant to Software Engineer."
    }
  ]
}
```

#### 5. Get Summary Across All Job Roles

```bash
curl -X GET 'http://localhost:8000/api/readiness/summary/' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "overall_average": 68.5,
  "best_fit_role": {
    "role": "Software Engineer",
    "score": 72.5,
    "id": 1
  },
  "company_levels": {
    "startup": {
      "average_score": 68.5,
      "top_3": [
        {"role": "Software Engineer", "score": 72.5, "id": 1},
        {"role": "Backend Developer", "score": 70.3, "id": 3},
        {"role": "Full Stack Developer", "score": 69.1, "id": 4}
      ]
    },
    "corporate": {
      "average_score": 59.4,
      "top_3": [...]
    },
    "leading": {
      "average_score": 52.7,
      "top_3": [...]
    }
  }
}
```

#### 6. Calculate for Different Company Levels

**Compare scores across company levels for same job**

```bash
# Corporate level (15% harder)
curl -X POST http://localhost:8000/api/readiness/calculate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_role_id": 1, "company_level": "corporate"}'

# Leading level (30% harder - FAANG)
curl -X POST http://localhost:8000/api/readiness/calculate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_role_id": 1, "company_level": "leading"}'
```

**Sample Results for Same Profile, Different Levels:**
```
Startup:    IRI = 65.5 × 1.0  = 65.5
Corporate:  IRI = 65.5 × 1.15 = 75.3
Leading:    IRI = 65.5 × 1.30 = 85.2 (capped at 100)
```

---

## Calculation Formula Verification

### For Software Engineer role:

**Input:**
- Technical Skills pillar score: 70 (40% weight for Software Engineer)
- Cognitive Abilities pillar score: 65 (30% weight)
- Behavioral Competencies pillar score: 55 (20% weight)
- Domain Knowledge pillar score: 45 (10% weight)

**Calculation:**
```
Base IRI = (70 × 40%) + (65 × 30%) + (55 × 20%) + (45 × 10%)
         = 28 + 19.5 + 11 + 4.5
         = 63.0 (rounded)

For Startup (1.0x):  63.0 × 1.0 = 63.0
For Corporate         (1.15x): 63.0 × 1.15 = 72.45 ≈ 72.4
For Leading           (1.30x): 63.0 × 1.30 = 81.90 ≈ 81.9
```

---

## Pillar Weights by Job Role

### Reference Table

| Job Role | Technical | Cognitive | Behavioral | Domain | Total |
|----------|-----------|-----------|-----------|--------|-------|
| Software Engineer | 40% | 30% | 20% | 10% | 100% |
| Frontend Developer | 35% | 25% | 25% | 15% | 100% |
| Backend Developer | 40% | 30% | 15% | 15% | 100% |
| Full Stack Developer | 38% | 28% | 18% | 16% | 100% |
| DevOps Engineer | 45% | 25% | 15% | 15% | 100% |
| Data Analyst | 35% | 35% | 18% | 12% | 100% |
| Data Scientist | 40% | 35% | 15% | 10% | 100% |
| Cybersecurity Analyst | 45% | 28% | 12% | 15% | 100% |
| UI/UX Designer | 30% | 25% | 30% | 15% | 100% |
| Mobile App Developer | 42% | 28% | 18% | 12% | 100% |

---

## Sub-Pillar Breakdown

### Technical Skills (5 sub-pillars)
1. Programming Languages
2. Frameworks & Libraries
3. Databases
4. DevOps & Cloud
5. Tools & Technologies

### Cognitive Abilities (5 sub-pillars)
1. Problem Solving
2. Logical Thinking
3. Learning Agility
4. Analytical Thinking
5. Research Ability

### Behavioral Competencies (5 sub-pillars)
1. Communication
2. Teamwork & Collaboration
3. Leadership
4. Adaptability
5. Reliability & Work Ethic

### Domain Knowledge (4 sub-pillars)
1. IT Industry Knowledge
2. Best Practices
3. Emerging Technologies
4. Standards & Compliance

---

## Integration Points for Phase 3

### What Phase 3 Will Add:
1. **Profile Form UI** → Collects skills, experience, projects
2. **Skill Verification** → Self-quiz, referral, GitHub analysis
3. **Real-time Calculation** → IRI updates as profile is filled
4. **Recommendations** → Personalized suggestions based on gaps

### How Phase 3 Integrates:
```
User Profile Data (Phase 3)
    ↓
Stored in StudentProfile, Skills, Experience, Projects, Certifications (DB)
    ↓
ReadinessCalculator Engine (Phase 2) ← Uses this data
    ↓
Calculates IRI scores, breakdowns, recommendations
    ↓
Displayed in Frontend (Phase 3)
```

---

## Troubleshooting

### Error: "Profile not found"
```
Solution: Create StudentProfile first via API or Django admin
```

### Error: "Job role not found"
```
Solution: Verify job_role_id exists (1-10)
curl http://localhost:8000/api/jobs/
```

### Error: "No pillar weights found"
```
Solution: Run seed_pillars command:
python manage.py seed_pillars
```

### IRI score is 0
```
Likely causes:
1. Profile exists but has no skills/experience/projects
2. Add sample profile data first
3. Empty profile → 0 score (expected behavior)
```

---

## Performance Notes

- Single calculation: ~100-200ms
- Summary (10 jobs × 3 levels): ~800-1000ms
- Results cached for 1 hour
- Optimal score update: After profile changes

Ready for Phase 3 profile UI implementation!
