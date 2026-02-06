import React, { useState } from 'react';
import styles from './Steps.module.css';

/**
 * Step1_BasicInfo - Basic profile information
 * 
 * Collects:
 * - Full Name (required)
 * - Date of Birth (optional)
 * - Location (optional)
 * - Headline (professional title)
 * - Summary (bio/about me)
 */
export default function Step1_BasicInfo({ data, onUpdate }) {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!data.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (data.date_of_birth && new Date(data.date_of_birth) > new Date()) {
      newErrors.date_of_birth = 'Birth date cannot be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className={styles.stepContainer}>
      {/* Step Title */}
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>👤 Basic Information</h2>
        <p className={styles.stepDescription}>
          Tell us about yourself
        </p>
      </div>

      {/* Form Fields */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Full Name <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="full_name"
          placeholder="John Doe"
          value={data.full_name || ''}
          onChange={handleChange}
          className={`${styles.input} ${errors.full_name ? styles.inputError : ''}`}
        />
        {errors.full_name && (
          <span className={styles.errorText}>{errors.full_name}</span>
        )}
      </div>

      <div className={styles.twoColumn}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={data.date_of_birth || ''}
            onChange={handleChange}
            className={`${styles.input} ${errors.date_of_birth ? styles.inputError : ''}`}
          />
          {errors.date_of_birth && (
            <span className={styles.errorText}>{errors.date_of_birth}</span>
          )}
          <span className={styles.helperText}>Help us calculate your career timeline</span>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Location</label>
          <input
            type="text"
            name="location"
            placeholder="City, Country"
            value={data.location || ''}
            onChange={handleChange}
            className={styles.input}
          />
          <span className={styles.helperText}>Where are you based?</span>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Professional Headline</label>
        <input
          type="text"
          name="headline"
          placeholder="e.g., Full Stack Developer | Startup Enthusiast"
          value={data.headline || ''}
          onChange={handleChange}
          className={styles.input}
          maxLength="120"
        />
        <span className={styles.helperText}>
          A short professional title ({data.headline?.length || 0}/120)
        </span>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Professional Summary</label>
        <textarea
          name="summary"
          placeholder="Tell us about your background, interests, and career goals..."
          value={data.summary || ''}
          onChange={handleChange}
          className={styles.textarea}
          rows="6"
          maxLength="500"
        />
        <span className={styles.helperText}>
          Share your story ({data.summary?.length || 0}/500)
        </span>
      </div>

      {/* Info Box */}
      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>ℹ️</span>
        <div>
          <p className={styles.infoTitle}>Why we need this information</p>
          <p className={styles.infoText}>
            This helps us create your professional profile and personalize your readiness score based on your career stage and location.
          </p>
        </div>
      </div>
    </div>
  );
}
