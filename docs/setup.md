# Setup Guide

## Backend Setup
1. Navigate to backend: cd backend
2. Activate venv: .\venv\Scripts\Activate.ps1
3. Install: pip install -r requirements.txt
4. Copy .env.example to .env and configure
5. Create MySQL database: iri_system
6. Run migrations: python manage.py migrate
7. Create superuser: python manage.py createsuperuser
8. Start server: python manage.py runserver

## Frontend Setup
1. Navigate to frontend: cd frontend
2. Install: npm install
3. Copy .env.example to .env
4. Start dev server: npm run dev
