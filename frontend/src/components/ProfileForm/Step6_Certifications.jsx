import React, { useState } from 'react';
import styles from './Steps.module.css';

/**
 * Step6_Certifications - Professional certifications and credentials
 * Users can add:
 * - Certification name
 * - Issuing organization
 * - Issue and expiry dates
 * - Credential URL for verification
 */
export default function Step6_Certifications({ data, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    credential_url: '',
    does_not_expire: false
  });

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '',
      issuer: '',
      issue_date: '',
      expiry_date: '',
      credential_url: '',
      does_not_expire: false
    });
    setShowForm(true);
  };

  const handleEditClick = (cert) => {
    setEditingId(cert.id);
    setFormData(cert);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.issuer.trim()) {
      alert('Please fill required fields');
      return;
    }

    let certs = [...data];
    if (editingId) {
      certs = certs.map(c => c.id === editingId ? { ...formData, id: editingId } : c);
    } else {
      certs.push({ ...formData, id: Date.now() });
    }

    onUpdate(certs);
    setShowForm(false);
  };

  const handleDelete = (certId) => {
    onUpdate(data.filter(c => c.id !== certId));
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>🏆 Certifications</h2>
        <p className={styles.stepDescription}>Add professional certifications and credentials</p>
      </div>

      {/* Info Box */}
      <div style={{
        background: '#e0f2fe',
        border: '2px solid #009b69',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <p style={{ margin: 0, color: '#00547c', fontWeight: 500 }}>
          💡 Add certifications that validate your professional expertise and qualifications
        </p>
      </div>

      {/* Certifications List */}
      {data && data.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          {data.map((cert) => (
            <div key={cert.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#111827' }}>{cert.name}</h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                    {cert.issuer}
                    {cert.issue_date && <span> • {cert.issue_date.split('-').reverse().join('/')}</span>}
                  </p>
                </div>
              </div>
              <div className={styles.itemActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEditClick(cert)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(cert.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className={styles.formModal}>
          <h3 className={styles.formModalTitle}>
            {editingId ? 'Edit Certification' : 'Add Certification'}
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Certification Name*</label>
            <input
              type="text"
              placeholder="e.g., AWS Solutions Architect, Google Cloud Certified"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Issuing Organization*</label>
            <input
              type="text"
              placeholder="e.g., Amazon, Google, Coursera"
              value={formData.issuer}
              onChange={(e) => handleChange('issuer', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.twoColumn}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Issue Date</label>
              <input
                type="month"
                value={formData.issue_date}
                onChange={(e) => handleChange('issue_date', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Expiry Date</label>
              <input
                type="month"
                value={formData.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
                className={styles.input}
                disabled={formData.does_not_expire}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.does_not_expire}
                onChange={(e) => handleChange('does_not_expire', e.target.checked)}
              />
              <span>This certification does not expire</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Credential URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.credential_url}
              onChange={(e) => handleChange('credential_url', e.target.value)}
              className={styles.input}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className={styles.btnSave}
              onClick={handleSave}
              style={{ flex: 1 }}
            >
              {editingId ? 'Update' : 'Add'}
            </button>
            <button
              className={styles.btnCancel}
              onClick={() => setShowForm(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!data || data.length === 0) && !showForm && (
        <div className={styles.emptyState}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🏆</p>
          <p style={{ margin: 0, color: '#6b7280' }}>No certifications added yet</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#9ca3af' }}>
            Add certifications to showcase your professional qualifications
          </p>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          className={styles.emptyStateButton}
          onClick={handleAddClick}
          style={{ width: '100%' }}
        >
          ➕ Add Certification
        </button>
      )}
    </div>
  );
}
