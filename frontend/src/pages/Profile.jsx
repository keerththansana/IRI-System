import React from 'react';
import ProfileFormContainer from '../components/ProfileForm/ProfileFormContainer';

/**
 * Profile Page - Main profile creation and editing interface
 * Renders the multi-step profile form
 */
export default function Profile() {
  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: '2rem' }}>
      <ProfileFormContainer />
    </div>
  );
}


