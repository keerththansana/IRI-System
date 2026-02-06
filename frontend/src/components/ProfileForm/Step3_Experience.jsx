import React, { useState } from 'react';
import styles from './Steps.module.css';

/**
 * Step3_Experience - Work experience entries
 * Collects: Company, Role, Duration, Description, Referral details
 */
export default function Step3_Experience({ data, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [newEntry, setNewEntry] = useState({
    company: '',
    role_title: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    referral_name: '',
    referral_email: ''
  });

  const handleAdd = () => {
    if (!newEntry.company?.trim() || !newEntry.role_title?.trim()) {
      return;
    }
    const experiences = [...data];
    if (editingId !== null) {
      experiences[editingId] = { ...newEntry };
      setEditingId(null);
    } else {
      experiences.push({ ...newEntry, id: Date.now() });
    }
    onUpdate(experiences);
    setNewEntry({
      company: '',
      role_title: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      referral_name: '',
      referral_email: ''
    });
  };

  const handleDelete = (index) => {
    onUpdate(data.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditingId(index);
    setNewEntry(data[index]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>💼 Work Experience</h2>
        <p className={styles.stepDescription}>Add your professional experience</p>
      </div>

      {data && data.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {data.map((exp, index) => (
            <div key={exp.id || index} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <div>
                  <p className={styles.itemTitle}>{exp.role_title} at {exp.company}</p>
                  <p className={styles.itemSubtitle}>
                    {exp.is_current ? '🟢 Current' : 'Completed'}
                  </p>
                </div>
                <div className={styles.itemActions}>
                  <button className={styles.editBtn} onClick={() => handleEdit(index)}>✏️ Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(index)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.formModal}>
        <h3 className={styles.formModalTitle}>
          {editingId !== null ? 'Edit Experience' : 'Add Work Experience'}
        </h3>

        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Company Name <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={newEntry.company || ''}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Job Title <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="role_title"
              placeholder="Software Engineer"
              value={newEntry.role_title || ''}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Start Date</label>
            <input
              type="month"
              name="start_date"
              value={newEntry.start_date || ''}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>End Date</label>
            <input
              type="month"
              name="end_date"
              value={newEntry.end_date || ''}
              onChange={handleInputChange}
              disabled={newEntry.is_current}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_current"
              checked={newEntry.is_current || false}
              onChange={handleInputChange}
              style={{ marginRight: '0.5rem', cursor: 'pointer', width: 'auto' }}
            />
            I currently work here
          </label>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description (Optional)</label>
          <textarea
            name="description"
            placeholder="Describe your responsibilities and achievements..."
            value={newEntry.description || ''}
            onChange={handleInputChange}
            className={styles.textarea}
            rows="4"
          />
        </div>

        <div className={styles.stepHeader} style={{ marginTop: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#009b69' }}>Referral Details (Optional)</h3>
        </div>

        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Referral Name</label>
            <input
              type="text"
              name="referral_name"
              placeholder="Manager or colleague name"
              value={newEntry.referral_name || ''}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Referral Email</label>
            <input
              type="email"
              name="referral_email"
              placeholder="someone@company.com"
              value={newEntry.referral_email || ''}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formModalActions}>
          <button className={styles.btnCancel} onClick={() => { setEditingId(null); setNewEntry({ company: '', role_title: '', start_date: '', end_date: '', is_current: false, description: '', referral_name: '', referral_email: '' }); }}>Cancel</button>
          <button className={styles.btnSave} onClick={handleAdd}>{editingId !== null ? '✅ Update' : '➕ Add Experience'}</button>
        </div>
      </div>
    </div>
  );
}
