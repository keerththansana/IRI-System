-- Create IRI System Database
CREATE DATABASE IF NOT EXISTS iri_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated user for IRI application
CREATE USER IF NOT EXISTS 'iri_user'@'localhost' IDENTIFIED BY 'iri_secure_password_123';

-- Grant all privileges on IRI database to iri_user
GRANT ALL PRIVILEGES ON iri_system.* TO 'iri_user'@'localhost';

-- Flush privileges to ensure they take effect
FLUSH PRIVILEGES;

-- Display confirmation
SELECT 'Database and user created successfully!' as Status;
