# IRI System - Production Setup Guide

## Overview
This guide covers setting up the Industry Readiness Index (IRI) System with proper architecture, database, and configuration.

## Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Git

## Part 1: Backend Setup

### Step 1: Create Virtual Environment

Navigate to backend and create Python virtual environment:

```bash
cd C:\Users\Keerththansana\Desktop\IRI-System\backend
python -m venv venv
```

**Why?** Virtual environments isolate project dependencies and prevent conflicts with system packages.

### Step 2: Activate Virtual Environment

```bash
# On Windows
venv\Scripts\activate

# You should see (venv) at the start of terminal line
```

**Why?** Ensures all Python packages install in isolated environment.

### Step 3: Upgrade pip

```bash
python -m pip install --upgrade pip
```

**Why?** Latest pip has better dependency resolution and security patches.

### Step 4: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

**Why?** Installs Django, DRF, JWT, MySQL connector, and other necessary packages.

### Step 5: Configure Environment Variables

```bash
# Copy example to create actual .env file
copy .env.example .env
```

Then edit `.env` with your configuration:
- Set DATABASE_PASSWORD to your MySQL password
- Keep GEMINI_API_KEY (already provided)
- Update ALLOWED_HOSTS for production

**Why?** Environment variables keep sensitive data secure and allow environment-specific configuration.

### Step 6: Create MySQL Database

```bash
mysql -u root -p
```

In MySQL CLI:
```sql
CREATE DATABASE iri_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iri_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON iri_system.* TO 'iri_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Why?** Creates dedicated database with proper character encoding for multilingual support.

### Step 7: Run Migrations

```bash
python manage.py migrate
```

**Why?** Creates all database tables from Django models.

### Step 8: Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

Follow prompts to create admin account. Remember these credentials.

**Why?** Admin account needed to manage Django admin panel and system configuration.

### Step 9: Seed Initial Data (10 Job Roles + Pillars)

```bash
python manage.py seed_jobs
```

**Why?** Populates database with 10 IT job roles, 4 pillars, and skill weightings.

### Step 10: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

**Why?** Prepares static files for production deployment.

### Step 11: Test Backend

```bash
python manage.py runserver 0.0.0.0:8000
```

Visit: `http://localhost:8000/api/jobs/`

**Why?** Verifies backend is running and API endpoints are accessible.

---

## Part 2: Frontend Setup

### Step 1: Install Dependencies

```bash
cd C:\Users\Keerththansana\Desktop\IRI-System\frontend
npm install
```

**Why?** Installs React, Tailwind CSS, Vite, and all necessary packages.

### Step 2: Configure Environment

Create `.env.local` file:

```bash
VITE_API_URL=http://localhost:8000/api
```

**Why?** Tells frontend where to find backend API.

### Step 3: Run Development Server

```bash
npm run dev -- --port=5173
```

Visit: `http://localhost:5173/`

**Why?** Starts Vite dev server with hot reload for development.

---

## Part 3: Verify Full System

### Check Backend

```bash
curl http://localhost:8000/api/jobs/
```

Expected: JSON list of jobs (should show 10 IT roles)

### Check Frontend

Visit `http://localhost:5173/` in browser

Expected: Login page displays

---

## Project File Structure Summary

```
IRI-System/
├── backend/
│   ├── venv/                    # Python virtual environment
│   ├── iri_backend/             # Django project settings
│   │   ├── settings.py          # **MODIFY THIS FOR DATABASE/APPS**
│   │   ├── urls.py              # API routes
│   │   └── wsgi.py
│   ├── accounts/                # User authentication
│   ├── profiles/                # Student profile management
│   ├── jobs/                    # Job roles and pillars
│   ├── readiness/               # Readiness calculation
│   ├── verification/            # Verification system
│   ├── skills/                  # Skill management
│   ├── management/commands/     # Custom Django commands
│   │   └── seed_jobs.py         # **CREATE THIS to populate data**
│   ├── manage.py                # Django CLI
│   ├── requirements.txt         # Dependencies
│   ├── .env                     # Production variables (NEVER commit)
│   ├── .env.example             # Example env variables
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Header, Footer, Layout
│   │   │   ├── forms/           # Profile, verification forms
│   │   │   └── readiness/       # Dashboard, results
│   │   ├── pages/               # Full page components
│   │   ├── context/             # Auth, Profile context
│   │   ├── services/            # API communication
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Helper functions
│   │   └── styles/              # Global CSS
│   ├── public/                  # Static files
│   ├── package.json             # Dependencies
│   ├── vite.config.js           # Build configuration
│   ├── tailwind.config.js       # Tailwind theming
│   ├── .env.local               # Frontend API URL
│   └── README.md
│
├── docs/
│   ├── ARCHITECTURE.md          # **Already created**
│   ├── DATABASE_SCHEMA.md       # **Already created**
│   ├── SETUP_GUIDE.md           # **This file**
│   └── API_DOCUMENTATION.md     # **To create**
│
├── scripts/                     # Deployment scripts
├── .gitignore                   # Git ignore file
└── README.md                    # Main project README
```

---

## Next Steps

1. **Create Django Models** - Expand existing models with full schema
2. **Create API Serializers** - Define data format for API responses
3. **Create API Views** - Build REST endpoints
4. **Build Frontend Components** - Create pages and reusable components
5. **Implement Readiness Calculation** - Core scoring engine
6. **Implement Verification System** - Self, referral, link verification
7. **Integration Testing** - Test full end-to-end flow
8. **Deployment** - Docker, server setup, domain configuration

---

## Troubleshooting

### MySQL Connection Error
```
"Can't connect to MySQL server"
```
**Solution**: Ensure MySQL is running
```bash
# Check MySQL service
mysql -u root -p
```

### Django Migration Error
```
"No such table"
```
**Solution**: Run migrations
```bash
python manage.py migrate
```

### Frontend API Connection Error
```
"CORS error" or "Cannot reach localhost:8000"
```
**Solution**: 
- Ensure backend is running on port 8000
- Check CORS_ALLOWED_ORIGINS in Django settings.py

### Vite Hot Reload Not Working
```
"Port already in use"
```
**Solution**: Kill existing process on port 5173
```bash
# Windows
netstat -ano | findstr ":5173"
taskkill /PID <PID> /F
```

---

## Production Deployment Checklist

- [ ] Set DEBUG=False in .env
- [ ] Change SECRET_KEY to secure random value
- [ ] Configure proper DATABASE credentials
- [ ] Set up email server for referral verification
- [ ] Enable HTTPS only
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring and alerts
- [ ] Create deployment documentation
- [ ] Set up CI/CD pipeline with GitHub Actions
