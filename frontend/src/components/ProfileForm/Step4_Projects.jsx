import React, { useState } from 'react';
import styles from './Steps.module.css';

/**
 * Step4_Projects - Portfolio projects with GitHub/Live links
 */
export default function Step4_Projects({ data, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    technologies: '',
    tools: '',
    start_date: '',
    end_date: '',
    github_link: '',
    live_link: '',
    contribution: '',
    referral_name: '',
    referral_email: ''
  });

  const handleAdd = () => {
    if (!newEntry.title?.trim() || !newEntry.description?.trim()) return;
    const projects = [...data];
    if (editingId !== null) {
      projects[editingId] = { ...newEntry };
      setEditingId(null);
    } else {
      projects.push({ ...newEntry, id: Date.now() });
    }
    onUpdate(projects);
    setNewEntry({ title: '', description: '', technologies: '', tools: '', start_date: '', end_date: '', github_link: '', live_link: '', contribution: '', referral_name: '', referral_email: '' });
  };

  const handleDelete = (index) => {
    onUpdate(data.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditingId(index);
    setNewEntry(data[index]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>🚀 Projects & Portfolio</h2>
        <p className={styles.stepDescription}>Showcase your best work</p>
      </div>

      {data && data.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {data.map((proj, index) => (
            <div key={proj.id || index} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <div>
                  <p className={styles.itemTitle}>{proj.title}</p>
                  <p className={styles.itemSubtitle}>{proj.technologies}</p>
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
        <h3 className={styles.formModalTitle}>{editingId !== null ? 'Edit Project' : 'Add Project'}</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>Project Title <span className={styles.required}>*</span></label>
          <input type="text" name="title" placeholder="Project name" value={newEntry.title || ''} onChange={handleInputChange} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description <span className={styles.required}>*</span></label>
          <textarea name="description" placeholder="What does this project do?" value={newEntry.description || ''} onChange={handleInputChange} className={styles.textarea} rows="4" />
        </div>

        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Technologies Used</label>
            <input type="text" name="technologies" placeholder="React, Node.js, PostgreSQL..." value={newEntry.technologies || ''} onChange={handleInputChange} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tools</label>
            <input type="text" name="tools" placeholder="Git, Docker, AWS..." value={newEntry.tools || ''} onChange={handleInputChange} className={styles.input} />
          </div>
        </div>

        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>GitHub Link</label>
            <input type="url" name="github_link" placeholder="https://github.com/..." value={newEntry.github_link || ''} onChange={handleInputChange} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Live Link</label>
            <input type="url" name="live_link" placeholder="https://yourproject.com" value={newEntry.live_link || ''} onChange={handleInputChange} className={styles.input} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Your Contribution</label>
          <textarea name="contribution" placeholder="What was your specific role?" value={newEntry.contribution || ''} onChange={handleInputChange} className={styles.textarea} rows="3" />
        </div>

        <div className={styles.formModalActions}>
          <button className={styles.btnCancel} onClick={() => { setEditingId(null); setNewEntry({ title: '', description: '', technologies: '', tools: '', start_date: '', end_date: '', github_link: '', live_link: '', contribution: '', referral_name: '', referral_email: '' }); }}>Cancel</button>
          <button className={styles.btnSave} onClick={handleAdd}>{editingId !== null ? '✅ Update' : '➕ Add Project'}</button>
        </div>
      </div>
    </div>
  );
}
