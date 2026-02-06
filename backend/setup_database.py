#!/usr/bin/env python
"""
Setup MySQL Database for IRI System
Connects to MySQL and creates database + user
"""
import os
import sys
import getpass
import mysql.connector
from mysql.connector import Error

def setup_database():
    """Create IRI database and user"""
    
    print("=" * 60)
    print("IRI System - MySQL Database Setup")
    print("=" * 60)
    
    # Get MySQL root password
    root_password = getpass.getpass("Enter your MySQL root password: ")
    
    try:
        # Connect to MySQL as root
        print("\nConnecting to MySQL as root...")
        connection = mysql.connector.connect(
            host='localhost',
            port=3306,
            user='root',
            password=root_password
        )
        
        if connection.is_connected():
            print("✓ Connected successfully!")
            cursor = connection.cursor()
            
            # Create database
            print("\nCreating database 'iri_system'...")
            cursor.execute("""
                CREATE DATABASE IF NOT EXISTS iri_system 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci
            """)
            print("✓ Database created!")
            
            # Create user
            print("\nCreating user 'iri_user'@'localhost'...")
            cursor.execute("""
                CREATE USER IF NOT EXISTS 'iri_user'@'localhost' 
                IDENTIFIED BY 'iri_secure_password_123'
            """)
            print("✓ User created!")
            
            # Grant privileges
            print("\nGranting privileges to 'iri_user' on 'iri_system'...")
            cursor.execute("""
                GRANT ALL PRIVILEGES ON iri_system.* 
                TO 'iri_user'@'localhost'
            """)
            print("✓ Privileges granted!")
            
            # Flush privileges
            cursor.execute("FLUSH PRIVILEGES")
            print("✓ Privileges flushed!")
            
            # Verify
            cursor.execute("SELECT VERSION()")
            db_version = cursor.fetchone()
            print(f"\n✓ MySQL Version: {db_version[0]}")
            
            cursor.close()
            connection.close()
            
            print("\n" + "=" * 60)
            print("SUCCESS! Database setup complete!")
            print("=" * 60)
            print("\nCredentials:")
            print(f"  Database: iri_system")
            print(f"  User: iri_user")
            print(f"  Password: iri_secure_password_123")
            print("\nUpdate your .env file with these credentials.")
            print("=" * 60)
            
            return True
            
    except Error as e:
        print(f"\n✗ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure MySQL is running")
        print("2. Check your root password")
        print("3. Verify MySQL server is accessible at localhost:3306")
        return False
    
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
        return False

if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1)
