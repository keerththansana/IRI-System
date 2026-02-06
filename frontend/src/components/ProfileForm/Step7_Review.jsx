import React from 'react';
import styles from './Steps.module.css';

/**
 * Step7_Review - Review profile data before final submission
 * Shows summary of all entered data
 * Allows jumping back to edit specific sections
 * Validates all required fields
 */
export default function Step7_Review({ data, onEdit }) {
  const sections = [
    {
      title: 'Basic Information',
      icon: '👤',
      step: 1,
      items: [
        { label: 'Full Name', value: data.basic_info?.full_name },
        { label: 'Date of Birth', value: data.basic_info?.date_of_birth },
        { label: 'Location', value: data.basic_info?.location },
        { label: 'Headline', value: data.basic_info?.headline },
      ],
      complete: !!data.basic_info?.full_name
    },
    {
      title: 'Education',
      icon: '🎓',
      step: 2,
      count: data.educations?.length || 0,
      complete: (data.educations?.length || 0) > 0
    },
    {
      title: 'Work Experience',
      icon: '💼',
      step: 3,
      count: data.experiences?.length || 0,
      complete: (data.experiences?.length || 0) > 0
    },
    {
      title: 'Projects',
      icon: '📂',
      step: 4,
      count: data.projects?.length || 0,
      complete: (data.projects?.length || 0) > 0
    },
    {
      title: 'Skills',
      icon: '⚡',
      step: 5,
      count: data.skills?.length || 0,
      complete: (data.skills?.length || 0) > 0
    },
    {
      title: 'Certifications',
      icon: '🏆',
      step: 6,
      count: data.certifications?.length || 0,
      complete: true
    }
  ];

  const isProfileComplete = sections.slice(0, 5).every(s => s.complete);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>✅ Review Your Profile</h2>
        <p className={styles.stepDescription}>Verify all information before submitting</p>
      </div>

      {/* Completion Status */}
      <div style={{
        background: isProfileComplete ? '#ecfdf5' : '#fef2f2',
        border: `2px solid ${isProfileComplete ? '#009b69' : '#dc2626'}`,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <p style={{
          margin: 0,
          color: isProfileComplete ? '#065f46' : '#7f1d1d',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {isProfileComplete ? '✨ Profile Ready!' : '⚠️ Incomplete Information'}
        </p>
        <p style={{
          margin: '0.5rem 0 0',
          color: isProfileComplete ? '#047857' : '#991b1b',
          fontSize: '0.9rem'
        }}>
          {isProfileComplete
            ? 'Your profile looks great! Ready to see your readiness score.'
            : 'Please fill all required sections to get your readiness assessment.'}
        </p>
      </div>

      {/* Section Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {sections.map((section) => (
          <div
            key={section.step}
            className={styles.itemCard}
            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{section.icon}</span>
                  {section.title}
                </h4>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                  {section.complete ? '✓ Complete' : 'Incomplete'}
                  {section.count !== undefined && ` • ${section.count} items`}
                </p>
              </div>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: section.complete ? '#009b69' : '#e5e7eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {section.complete ? '✓' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Basic Info Details */}
      {data.basic_info?.full_name && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 600 }}>👤 Basic Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {data.basic_info.full_name && (
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Full Name</p>
                <p style={{ margin: '0.25rem 0 0', color: '#111827', fontWeight: 500 }}>{data.basic_info.full_name}</p>
              </div>
            )}
            {data.basic_info.date_of_birth && (
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Date of Birth</p>
                <p style={{ margin: '0.25rem 0 0', color: '#111827', fontWeight: 500 }}>{data.basic_info.date_of_birth}</p>
              </div>
            )}
            {data.basic_info.location && (
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Location</p>
                <p style={{ margin: '0.25rem 0 0', color: '#111827', fontWeight: 500 }}>{data.basic_info.location}</p>
              </div>
            )}
            {data.basic_info.headline && (
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Headline</p>
                <p style={{ margin: '0.25rem 0 0', color: '#111827', fontWeight: 500 }}>{data.basic_info.headline}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Preview */}
      {data.skills && data.skills.length > 0 && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem', color: '#111827', fontSize: '0.95rem', fontWeight: 600 }}>⚡ Top Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.skills.slice(0, 8).map((skill, idx) => (
              <div
                key={idx}
                style={{
                  background: '#00547c',
                  color: 'white',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                {skill.name}
              </div>
            ))}
            {data.skills.length > 8 && (
              <div
                style={{
                  background: '#e5e7eb',
                  color: '#111827',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                +{data.skills.length - 8} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div style={{
        background: '#e0f2fe',
        border: '2px solid #009b69',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <p style={{ margin: 0, color: '#00547c', fontWeight: 500, fontSize: '0.9rem' }}>
          💡 After submitting, we'll assess your readiness for different company levels (Startup, Corporate, Leading) and show you personalized recommendations.
        </p>
      </div>

      {/* Note about verification */}
      <div style={{
        background: '#fef3c7',
        border: '2px solid #fbbf24',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        <p style={{ margin: 0, color: '#92400e', fontWeight: 500, fontSize: '0.9rem' }}>
          🔒 Your profile may be verified through referrals and LinkedIn analysis to ensure accuracy.
        </p>
      </div>
    </div>
  );
}
