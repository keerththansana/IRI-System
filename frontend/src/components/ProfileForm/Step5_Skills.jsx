import React, { useState } from 'react';
import styles from './Steps.module.css';

/**
 * Step5_Skills - Skills with proficiency levels
 * Skills can be:
 * - Added manually
 * - Suggested by Gemini AI
 * - Extracted from projects/experience
 */
export default function Step5_Skills({ data, onUpdate }) {
  const [newSkill, setNewSkill] = useState('');
  const [proficiency, setProficiency] = useState(3);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const skills = [...data];
    if (!skills.find(s => s.name?.toLowerCase() === newSkill.toLowerCase())) {
      skills.push({ id: Date.now(), name: newSkill, proficiency });
      onUpdate(skills);
      setNewSkill('');
      setProficiency(3);
    }
  };

  const handleAddSuggestion = (skill) => {
    if (!data.find(s => s.name?.toLowerCase() === skill.toLowerCase())) {
      const skills = [...data, { id: Date.now(), name: skill, proficiency: 2 }];
      onUpdate(skills);
      setSuggestions(suggestions.filter(s => s !== skill));
    }
  };

  const handleRemoveSkill = (index) => {
    onUpdate(data.filter((_, i) => i !== index));
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    // TODO: Call Gemini API to get skill suggestions
    setTimeout(() => {
      setSuggestions(['React', 'Python', 'Docker', 'AWS', 'Problem Solving']);
      setLoadingSuggestions(false);
    }, 1000);
  };

  const proficiencyLabels = {
    1: 'Beginner',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>⚡ Skills</h2>
        <p className={styles.stepDescription}>List your technical and professional skills</p>
      </div>

      {/* Current Skills */}
      {data && data.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#111827' }}>Your Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.map((skill, index) => (
              <div key={skill.id || index} className={styles.skillTag}>
                {skill.name}
                <button className={styles.skillTagRemove} onClick={() => handleRemoveSkill(index)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Skill Manually */}
      <div className={styles.formModal}>
        <h3 className={styles.formModalTitle}>Add Skill</h3>
        
        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Skill Name</label>
            <input
              type="text"
              placeholder="e.g., Python, React, Leadership"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Proficiency</label>
            <select
              value={proficiency}
              onChange={(e) => setProficiency(parseInt(e.target.value))}
              className={styles.select}
            >
              {Object.entries(proficiencyLabels).map(([level, label]) => (
                <option key={level} value={level}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <button className={styles.btnSave} onClick={handleAddSkill} style={{ width: '100%' }}>➕ Add Skill</button>
      </div>

      {/* Get AI Suggestions */}
      <button
        className={styles.emptyStateButton}
        onClick={handleGetSuggestions}
        disabled={loadingSuggestions}
        style={{ width: '100%', marginTop: '1.5rem' }}
      >
        {loadingSuggestions ? '⏳ Getting suggestions...' : '✨ Get Skill Suggestions from AI'}
      </button>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#dbeafe', borderRadius: '8px' }}>
          <p style={{ marginTop: 0, color: '#00547c', fontWeight: 600 }}>Suggested Skills</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {suggestions.map((skill) => (
              <button
                key={skill}
                onClick={() => handleAddSuggestion(skill)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#00547c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
