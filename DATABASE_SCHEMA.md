# IRI System Database Schema

## Database Configuration

**Database System**: MySQL
**Connection Pool**: 10-50 connections
**Character Set**: utf8mb4
**Collation**: utf8mb4_unicode_ci

## Core Tables

### 1. accounts_user (Extended from Django User)
```
id (PK)
username (UNIQUE, VARCHAR 150)
email (UNIQUE, EMAIL)
first_name (VARCHAR 150)
last_name (VARCHAR 150)
password (VARCHAR 128) - Hashed
is_active (BOOLEAN, DEFAULT TRUE)
is_staff (BOOLEAN, DEFAULT FALSE)
is_superuser (BOOLEAN, DEFAULT FALSE)
date_joined (DATETIME)
last_login (DATETIME, NULLABLE)
```

### 2. profiles_studentprofile
```
id (PK)
user_id (FK → accounts_user, UNIQUE)
full_name (VARCHAR 255)
date_of_birth (DATE)
phone (VARCHAR 20, NULLABLE)
bio (TEXT, NULLABLE)
profile_picture (IMAGE, NULLABLE)
current_education_level (ENUM: highschool, diploma, bachelors, masters, phd)
expected_graduation (DATE, NULLABLE)
location (VARCHAR 255, NULLABLE)
linkedin_url (URL, NULLABLE)
github_url (URL, NULLABLE)
portfolio_url (URL, NULLABLE)
created_at (DATETIME)
updated_at (DATETIME)
profile_completion_percentage (INT, 0-100)
```

**Why**: Central student profile with verification links and progress tracking

### 3. profiles_education
```
id (PK)
profile_id (FK → profiles_studentprofile)
institution_name (VARCHAR 255)
education_level (ENUM: highschool, diploma, bachelors, masters, phd)
field_of_study (VARCHAR 255)
description (TEXT, NULLABLE)
start_date (DATE)
end_date (DATE, NULLABLE)
is_ongoing (BOOLEAN)
grade_or_score (VARCHAR 50, NULLABLE)
certificate_url (URL, NULLABLE)
verified_at (DATETIME, NULLABLE)
verification_status (ENUM: unverified, pending, verified)
created_at (DATETIME)
updated_at (DATETIME)
```

**Why**: Track educational background with verification trail

### 4. profiles_experience
```
id (PK)
profile_id (FK → profiles_studentprofile)
job_title (VARCHAR 255)
company_name (VARCHAR 255)
description (TEXT)
employment_type (ENUM: full-time, part-time, contract, freelance, internship)
start_date (DATE)
end_date (DATE, NULLABLE)
is_current_role (BOOLEAN)
referral_name (VARCHAR 255, NULLABLE)
referral_email (EMAIL, NULLABLE)
referral_phone (VARCHAR 20, NULLABLE)
verified_at (DATETIME, NULLABLE)
verification_status (ENUM: unverified, pending, verified)
created_at (DATETIME)
updated_at (DATETIME)
```

**Why**: Work experience with optional referral verification

### 5. profiles_project
```
id (PK)
profile_id (FK → profiles_studentprofile)
title (VARCHAR 255)
description (TEXT)
technologies_used (JSON array)
tools_used (JSON array)
start_date (DATE)
end_date (DATE, NULLABLE)
is_ongoing (BOOLEAN)
contribution_description (TEXT)
github_link (URL, NULLABLE)
live_link (URL, NULLABLE)
referral_name (VARCHAR 255, NULLABLE)
referral_email (EMAIL, NULLABLE)
referral_phone (VARCHAR 20, NULLABLE)
verified_at (DATETIME, NULLABLE)
verification_status (ENUM: unverified, pending, verified)
link_verified_at (DATETIME, NULLABLE)
created_at (DATETIME)
updated_at (DATETIME)
```

**Why**: Portfolio projects with multi-source verification (referral + links)

### 6. profiles_skill
```
id (PK)
profile_id (FK → profiles_studentprofile)
skill_name (VARCHAR 255)
proficiency_level (ENUM: beginner, intermediate, advanced, expert)
endorsements_count (INT, DEFAULT 0)
context (TEXT, NULLABLE) - Where/how learned
evidenced_from (JSON) - ['education', 'project', 'experience']
verified_at (DATETIME, NULLABLE)
verification_status (ENUM: unverified, verified)
suggested_by_ai (BOOLEAN, DEFAULT FALSE)
created_at (DATETIME)
updated_at (DATETIME)
```

**Why**: Skills track with AI suggestions and multi-source evidence

### 7. jobs_jobrole
```
id (PK)
name (VARCHAR 255, UNIQUE)
description (TEXT)
industry (VARCHAR 100) - Initial: IT
years_of_experience_required (INT)
salary_range_min (DECIMAL)
salary_range_max (DECIMAL)
required_education_level (ENUM: highschool, diploma, bachelors, masters, phd)
is_active (BOOLEAN, DEFAULT TRUE)
order_index (INT) - Display order
created_at (DATETIME)
updated_at (DATETIME)

-- 10 Default IT Jobs:
1. Software Developer
2. Data Engineer
3. Data Scientist
4. DevOps Engineer
5. Frontend Developer
6. Backend Developer
7. Full Stack Developer
8. Mobile App Developer
9. Cloud Architect
10. Security Analyst
```

**Why**: Define accessible job roles with requirements

### 8. jobs_pillar
```
id (PK)
name (VARCHAR 100, UNIQUE)
description (TEXT)
order_index (INT)
is_active (BOOLEAN, DEFAULT TRUE)

-- 4 Core Pillars:
1. Technical Skills (Hard Skills)
2. Cognitive Abilities (Problem-solving, Learning)
3. Behavioral Competencies (Communication, Teamwork)
4. Domain Knowledge (Industry-specific)
```

**Why**: Core competency categories for IRI calculation

### 9. jobs_subpillar (Optional, under Pillar)
```
id (PK)
pillar_id (FK → jobs_pillar)
name (VARCHAR 100)
description (TEXT)
weight (DECIMAL, 0-1) - Within pillar
```

**Why**: Granular skill categorization (e.g., "Languages" under Technical)

### 10. jobs_jobpillarweight
```
id (PK)
job_role_id (FK → jobs_jobrole)
pillar_id (FK → jobs_pillar)
weight (DECIMAL, 0.1-0.4) - 10-40% importance
priority_order (INT)

Example:
- Software Developer → Technical: 0.35, Cognitive: 0.30, Behavioral: 0.20, Domain: 0.15
- Data Scientist → Technical: 0.30, Cognitive: 0.35, Behavioral: 0.20, Domain: 0.15
```

**Why**: Define importance of each competency per job role

### 11. jobs_skill
```
id (PK)
name (VARCHAR 255, UNIQUE)
pillar_id (FK → jobs_pillar)
sub_pillar_id (FK → jobs_subpillar, NULLABLE)
category (VARCHAR 100)
is_technical (BOOLEAN)
suggested_learning_resources (JSON, NULLABLE)
created_at (DATETIME)
```

**Why**: Global skill bank linked to pillars

### 12. jobs_jobskillweight
```
id (PK)
job_role_id (FK → jobs_jobrole)
skill_id (FK → jobs_skill)
weight (DECIMAL, 0-1) - Importance for job
priority_level (INT, 1-10) - Critical vs Nice-to-have
```

**Why**: Define skill importance for each job

### 13. readiness_readinessscore
```
id (PK)
profile_id (FK → profiles_studentprofile)
job_role_id (FK → jobs_jobrole)
company_level (ENUM: startup, corporate, leading)
overall_score (DECIMAL, 0-100)
technical_score (DECIMAL, 0-100)
cognitive_score (DECIMAL, 0-100)
behavioral_score (DECIMAL, 0-100)
domain_score (DECIMAL, 0-100)
verification_score (DECIMAL, 0-100) - Weighted by self/referral/link verification
data_completeness_score (DECIMAL, 0-100)
confidence_level (ENUM: low, medium, high) - Based on verification level
calculated_at (DATETIME)
is_latest (BOOLEAN, DEFAULT TRUE)
calculation_details (JSON) - Detailed breakdown
```

**Why**: Core readiness calculation with component breakdown

### 14. verification_verification
```
id (PK)
profile_id (FK → profiles_studentprofile)
job_role_id (FK → jobs_jobrole, NULLABLE)
verified_item_type (ENUM: education, experience, project, skill)
verified_item_id (INT) - ID of the item being verified
verification_status (ENUM: unverified, pending, self_verified, referral_verified, link_verified, approved)
created_at (DATETIME)
updated_at (DATETIME)
```

**Why**: Track all verifications across profile items

### 15. verification_selfverification
```
id (PK)
verification_id (FK → verification_verification)
quiz_questions (JSON) - AI-generated questions
quiz_answers (JSON) - Student answers
quiz_score (DECIMAL, 0-100)
time_taken_seconds (INT)
ai_confidence_score (DECIMAL, 0-1) - Confidence in validity
passed (BOOLEAN)
completed_at (DATETIME)
```

**Why**: Self-verification through AI-generated quizzes

### 16. verification_referralverification
```
id (PK)
verification_id (FK → verification_verification)
referral_name (VARCHAR 255)
referral_email (EMAIL)
referral_phone (VARCHAR 20, NULLABLE)
verification_link (VARCHAR 255, UNIQUE) - Unique link for referral
referral_score (DECIMAL, 0-100, NULLABLE)
referral_feedback (TEXT, NULLABLE)
verification_token_expires_at (DATETIME)
completed_at (DATETIME, NULLABLE)
created_at (DATETIME)
```

**Why**: Track referral verification process and status

### 17. verification_linkverification
```
id (PK)
verification_id (FK → verification_verification)
github_link (URL, NULLABLE)
live_link (URL, NULLABLE)
link_analysis_result (JSON)
code_quality_score (DECIMAL, 0-100, NULLABLE)
project_maturity_score (DECIMAL, 0-100, NULLABLE)
documentation_score (DECIMAL, 0-100, NULLABLE)
credibility_score (DECIMAL, 0-100) - Weighted combination
verified_at (DATETIME)
```

**Why**: Automated verification via GitHub and live project links

## Indexes (Performance Optimization)

```sql
-- Critical indexes for query performance
INDEX idx_profile_user (profile_id, user_id)
INDEX idx_education_profile (profile_id, created_at)
INDEX idx_experience_profile (profile_id, start_date)
INDEX idx_project_profile (profile_id, created_at)
INDEX idx_skill_profile (profile_id, skill_name)
INDEX idx_readiness_profile_job (profile_id, job_role_id)
INDEX idx_readiness_company_level (company_level)
INDEX idx_readiness_latest (profile_id, is_latest)
INDEX idx_verification_profile_status (profile_id, verification_status)
INDEX idx_verification_item (verified_item_type, verified_item_id)
INDEX idx_jobrole_active (is_active)
INDEX idx_pillar_order (order_index)
```

## Relationships Summary

```
User (1) ──→ (1) StudentProfile
         ──→ (∞) Education
         ──→ (∞) Experience
         ──→ (∞) Project
         ──→ (∞) Skill

StudentProfile ──→ (∞) ReadinessScore ←─ JobRole
                ──→ (∞) Verification

JobRole ──→ (∞) JobPillarWeight ←─ Pillar
        ──→ (∞) JobSkillWeight ←─ Skill

Pillar ──→ (∞) SubPillar
       ──→ (∞) Skill

Skill ──→ (∞) JobSkillWeight ←─ JobRole

Verification ──→ (1) SelfVerification
             ──→ (1) ReferralVerification
             ──→ (1) LinkVerification
```
