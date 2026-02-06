import React, { useState, useEffect } from 'react';
import profileService from '../../services/profileService';

/**
 * ReadinessPreview - Display calculated IRI scores for different company levels
 * Shows readiness percentage for Startup, Corporate, and Leading companies
 * Displays pillar breakdown and recommendations
 */
export default function ReadinessPreview({ profileId }) {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReadinessScore();
  }, [profileId]);

  const fetchReadinessScore = async () => {
    try {
      setLoading(true);
      const data = await profileService.getReadinessScore();
      setReadiness(data);
    } catch (err) {
      setError('Unable to calculate readiness score. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', margin: 0 }}>⏳</p>
        <p style={{ margin: '1rem 0 0', color: '#6b7280' }}>Calculating your readiness score...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', background: '#fef2f2', borderRadius: '8px' }}>
        <p style={{ margin: 0, color: '#991b1b', fontWeight: 600 }}>❌ {error}</p>
      </div>
    );
  }

  if (!readiness) {
    return null;
  }

  // Determine score ranges for styling
  const getScoreStyle = (score) => {
    if (score >= 75) return { color: '#009b69', bg: '#ecfdf5' };
    if (score >= 50) return { color: '#f59e0b', bg: '#fef3c7' };
    return { color: '#dc2626', bg: '#fef2f2' };
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return 'Excellent Fit';
    if (score >= 50) return 'Good Fit';
    return 'Needs Development';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#111827', fontSize: '1.75rem' }}>
          🎯 Your Industry Readiness Score
        </h2>
        <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
          See how ready you are for different company levels
        </p>
      </div>

      {/* Company Level Scores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Startup Score */}
        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.5rem',
          background: '#f9fafb',
          transition: 'all 0.3s'
        }}>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '1rem', fontWeight: 600 }}>🚀 Startup</h3>
          <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Fast-paced, high-impact environments
          </p>
          <div style={{
            margin: '1rem 0',
            padding: '1rem',
            background: getScoreStyle(readiness.startup_score).bg,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: getScoreStyle(readiness.startup_score).color }}>
              {Math.round(readiness.startup_score)}%
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: getScoreStyle(readiness.startup_score).color }}>
              {getScoreLabel(readiness.startup_score)}
            </p>
          </div>
        </div>

        {/* Corporate Score */}
        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.5rem',
          background: '#f9fafb',
          transition: 'all 0.3s'
        }}>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '1rem', fontWeight: 600 }}>🏢 Corporate</h3>
          <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Structured, established organizations
          </p>
          <div style={{
            margin: '1rem 0',
            padding: '1rem',
            background: getScoreStyle(readiness.corporate_score).bg,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: getScoreStyle(readiness.corporate_score).color }}>
              {Math.round(readiness.corporate_score)}%
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: getScoreStyle(readiness.corporate_score).color }}>
              {getScoreLabel(readiness.corporate_score)}
            </p>
          </div>
        </div>

        {/* Leading Score */}
        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.5rem',
          background: '#f9fafb',
          transition: 'all 0.3s'
        }}>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '1rem', fontWeight: 600 }}>👑 Leading</h3>
          <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Industry-leading, innovative companies
          </p>
          <div style={{
            margin: '1rem 0',
            padding: '1rem',
            background: getScoreStyle(readiness.leading_score).bg,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: getScoreStyle(readiness.leading_score).color }}>
              {Math.round(readiness.leading_score)}%
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: getScoreStyle(readiness.leading_score).color }}>
              {getScoreLabel(readiness.leading_score)}
            </p>
          </div>
        </div>
      </div>

      {/* Pillar Breakdown */}
      {readiness.pillar_scores && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#111827', fontSize: '1.1rem', fontWeight: 600 }}>
            📊 Pillar-wise Breakdown
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {Object.entries(readiness.pillar_scores).map(([pillar, score]) => (
              <div key={pillar} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                background: '#f9fafb'
              }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                  {pillar.replace(/_/g, ' ')}
                </p>
                <div style={{
                  margin: '0.75rem 0 0',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${score}%`,
                    background: score >= 75 ? '#009b69' : score >= 50 ? '#f59e0b' : '#dc2626',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <p style={{ margin: '0.5rem 0 0', color: '#111827', fontWeight: 600, fontSize: '0.9rem' }}>
                  {Math.round(score)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Strengths */}
        {readiness.strengths && readiness.strengths.length > 0 && (
          <div style={{
            border: '2px solid #d1fae5',
            borderRadius: '8px',
            padding: '1.5rem',
            background: '#ecfdf5'
          }}>
            <h4 style={{ margin: 0, color: '#065f46', fontSize: '1rem', fontWeight: 600 }}>✨ Your Strengths</h4>
            <ul style={{ margin: '1rem 0 0', paddingLeft: '1.5rem', color: '#047857' }}>
              {readiness.strengths.map((strength, idx) => (
                <li key={idx} style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas to Improve */}
        {readiness.gaps && readiness.gaps.length > 0 && (
          <div style={{
            border: '2px solid #fed7aa',
            borderRadius: '8px',
            padding: '1.5rem',
            background: '#fffbeb'
          }}>
            <h4 style={{ margin: 0, color: '#92400e', fontSize: '1rem', fontWeight: 600 }}>🎯 Areas to Develop</h4>
            <ul style={{ margin: '1rem 0 0', paddingLeft: '1.5rem', color: '#b45309' }}>
              {readiness.gaps.map((gap, idx) => (
                <li key={idx} style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {readiness.recommendations && (
        <div style={{
          marginTop: '2rem',
          border: '2px solid #0ea5e9',
          borderRadius: '8px',
          padding: '1.5rem',
          background: '#e0f2fe'
        }}>
          <h4 style={{ margin: 0, color: '#00547c', fontSize: '1rem', fontWeight: 600 }}>
            💡 Personalized Recommendations
          </h4>
          <p style={{ margin: '1rem 0 0', color: '#0c4a6e' }}>
            {readiness.recommendations}
          </p>
        </div>
      )}
    </div>
  );
}
