import React, { useState } from 'react';
import styles from './Steps.module.css';

/**
 * Step2_Education - Multiple education entries
 * 
 * For each education entry collect:
 * - Institution name
 * - Degree/Level
 * - Field of study
 * - Start and end dates
 * - Grade/GPA
 * - Description
 * - Skills (will be suggested by Gemini)
 */
export default function Step2_Education({ data, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [newEntry, setNewEntry] = useState({
    institution: '',
    level: 'degree',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
    grade: '',
    description: '',
    skills: []
  });

  const handleAddEducation = () => {
    const errors = validateEducation(newEntry);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const educations = [...data];
    if (editingId !== null) {
      educations[editingId] = { ...newEntry };
      setEditingId(null);
    } else {
      educations.push({ ...newEntry, id: Date.now() });
    }
    
    onUpdate(educations);
    setNewEntry({
      institution: '',
      level: 'degree',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false,
      grade: '',
      description: '',
      skills: []
    });
    setFormErrors({});
  };

  const validateEducation = (entry) => {
    const errors = {};
    
    if (!entry.institution?.trim()) {
      errors.institution = 'Institution name is required';
    }
    if (!entry.start_date) {
      errors.start_date = 'Start date is required';
    }
    if (!entry.is_current && !entry.end_date) {
      errors.end_date = 'End date is required (or mark as current)';
    }
    if (entry.start_date && entry.end_date && !entry.is_current) {
      if (new Date(entry.end_date) < new Date(entry.start_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    return errors;
  };

  const handleEdit = (index) => {
    setEditingId(index);
    setNewEntry(data[index]);
  };

  const handleDelete = (index) => {
    onUpdate(data.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  return (
    <div className={styles.stepContainer}>
      {/* Step Header */}
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>🎓 Education</h2>
        <p className={styles.stepDescription}>
          Add your educational background
        </p>
      </div>

      {/* Education List */}
      {data && data.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {data.map((edu, index) => (
            <div key={edu.id || index} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <div>
                  <p className={styles.itemTitle}>{edu.institution}</p>
                  <p className={styles.itemSubtitle}>
                    {edu.level === 'degree' && '📚 Bachelor/Master'}
                    {edu.level === 'diploma' && '📜 Diploma'}
                    {edu.level === 'secondary' && '📖 Secondary'}
                    {edu.level === 'primary' && '✏️ Primary'}
                    {edu.level === 'postgrad' && '🎓 Postgraduate'}
                    {' • '}{edu.field_of_study}{' • '}
                    {edu.is_current ? '🟢 Current' : 'Completed'}
                  </p>
                </div>
                <div className={styles.itemActions}>
                  <button 
                    className={styles.editBtn}
                    onClick={() => handleEdit(index)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(index)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className={styles.formModal}>
        <h3 className={styles.formModalTitle}>
          {editingId !== null ? 'Edit Education' : 'Add Education'}
        </h3>

        {/* Institution */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Institution Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="institution"
            placeholder="University Name"
            value={newEntry.institution || ''}
            onChange={handleInputChange}
            className={`${styles.input} ${formErrors.institution ? styles.inputError : ''}`}
          />
          {formErrors.institution && (
            <span className={styles.errorText}>{formErrors.institution}</span>
          )}
        </div>

        {/* Level & Field */}
        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Degree Level <span className={styles.required}>*</span></label>
            <select
              name="level"
              value={newEntry.level || 'degree'}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary (A/L, O/L, High School)</option>
              <option value="diploma">Diploma</option>
              <option value="degree">Bachelor's Degree</option>
              <option value="postgrad">Postgraduate (Master's, PhD)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Field of Study</label>
            <input
              type="text"
              name="field_of_study"
              placeholder="e.g., Computer Science"
              value={newEntry.field_of_study || ''}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>
        </div>

        {/* Dates */}
        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Start Date <span className={styles.required}>*</span></label>
            <input
              type="month"
              name="start_date"
              value={newEntry.start_date || ''}
              onChange={handleInputChange}
              className={`${styles.input} ${formErrors.start_date ? styles.inputError : ''}`}
            />
            {formErrors.start_date && (
              <span className={styles.errorText}>{formErrors.start_date}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              End Date {!newEntry.is_current && <span className={styles.required}>*</span>}
            </label>
            <input
              type="month"
              name="end_date"
              value={newEntry.end_date || ''}
              onChange={handleInputChange}
              disabled={newEntry.is_current}
              className={`${styles.input} ${formErrors.end_date ? styles.inputError : ''}`}
            />
            {formErrors.end_date && (
              <span className={styles.errorText}>{formErrors.end_date}</span>
            )}
          </div>
        </div>

        {/* Current Status */}
        <div className={styles.formGroup}>
          <label className={styles.label} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 500 }}>
            <input
              type="checkbox"
              name="is_current"
              checked={newEntry.is_current || false}
              onChange={handleInputChange}
              style={{ marginRight: '0.5rem', cursor: 'pointer', width: 'auto' }}
            />
            I'm still studying here
          </label>
        </div>

        {/* Grade */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Grade / GPA (Optional)</label>
          <input
            type="text"
            name="grade"
            placeholder="e.g., 3.8/4.0 or A"
            value={newEntry.grade || ''}
            onChange={handleInputChange}
            className={styles.input}
          />
          <span className={styles.helperText}>Your GPA, percentage, or grade</span>
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Description (Optional)</label>
          <textarea
            name="description"
            placeholder="Relevant coursework, honors, or details..."
            value={newEntry.description || ''}
            onChange={handleInputChange}
            className={styles.textarea}
            rows="4"
          />
          <span className={styles.helperText}>Tell us about relevant coursework or achievements</span>
        </div>

        {/* Action Buttons */}
        <div className={styles.formModalActions}>
          <button
            className={styles.btnCancel}
            onClick={() => {
              setEditingId(null);
              setNewEntry({
                institution: '',
                level: 'degree',
                field_of_study: '',
                start_date: '',
                end_date: '',
                is_current: false,
                grade: '',
                description: '',
                skills: []
              });
              setFormErrors({});
            }}
          >
            Cancel
          </button>
          <button
            className={styles.btnSave}
            onClick={handleAddEducation}
          >
            {editingId !== null ? '✅ Update Education' : '➕ Add Education'}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>💡</span>
        <div>
          <p className={styles.infoTitle}>Tip: Be specific about your education</p>
          <p className={styles.infoText}>
            Include all levels of education. Even secondary/A/L/O/L education matters. The system will help suggest relevant skills based on your field of study.
          </p>
        </div>
      </div>
    </div>
  );
}
