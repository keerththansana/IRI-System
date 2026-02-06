#!/usr/bin/env python
"""
Create Django Superuser for IRI System
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'iri_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

try:
    user = User.objects.create_superuser(
        username='admin',
        email='admin@irisystem.com',
        password='Admin@123456'
    )
    print("✓ Superuser 'admin' created successfully!")
    print(f"  Email: admin@irisystem.com")
    print(f"  Password: Admin@123456")
except IntegrityError:
    print("✓ Superuser 'admin' already exists!")
except Exception as e:
    print(f"✗ Error creating superuser: {e}")
