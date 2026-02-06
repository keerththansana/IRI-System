import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1_BasicInfo from './Step1_BasicInfo';
import Step2_Education from './Step2_Education';
import Step3_Experience from './Step3_Experience';
import Step4_Projects from './Step4_Projects';
import Step5_Skills from './Step5_Skills';
import Step6_Certifications from './Step6_Certifications';
import Step7_Review from './Step7_Review';
import styles from './ProfileForm.module.css';
import api from '../../services/api';

/**
 * ProfileFormContainer - Main multi-step profile creation form
 * 
 * Manages:
 * - State for all 7 form steps
 * - Auto-save to localStorage
 * - Progress tracking
 * - API integration
 * - Navigation between steps
 */
export default function ProfileFormContainer() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    basic_info: {
      full_name: '',
      date_of_birth: '',
      location: '',
      headline: '',
      summary: ''
    },
    // Step 2: Education
    educations: [],
    // Step 3: Experience
    experiences: [],
    // Step 4: Projects
    projects: [],
    // Step 5: Skills
    skills: [],
    // Step 6: Certifications
    certifications: [],
    // Step 7: Volunteering
    volunteering: []
  });

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('profile_form_draft');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Auto-save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('profile_form_draft', JSON.stringify(formData));
  }, [formData]);

  // Update basic info
  const updateBasicInfo = (updates) => {
    setFormData(prev => ({
      ...prev,
      basic_info: { ...prev.basic_info, ...updates }
    }));
  };

  // Update education list
  const updateEducations = (educations) => {
    setFormData(prev => ({ ...prev, educations }));
  };

  // Update experience list
  const updateExperiences = (experiences) => {
    setFormData(prev => ({ ...prev, experiences }));
  };

  // Update projects list
  const updateProjects = (projects) => {
    setFormData(prev => ({ ...prev, projects }));
  };

  // Update skills list
  const updateSkills = (skills) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  // Update certifications list
  const updateCertifications = (certifications) => {
    setFormData(prev => ({ ...prev, certifications }));
  };

  // Update volunteering list
  const updateVolunteering = (volunteering) => {
    setFormData(prev => ({ ...prev, volunteering }));
  };

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Submit the entire profile
  const handleSubmit = async () => {
    console.log('Submit button clicked!');
    console.log('Form data:', formData);
    
    // Validate required fields
    if (!formData.basic_info.full_name || !formData.basic_info.full_name.trim()) {
      setErrorMessage('⚠️ Please enter your full name in Step 1 (Basic Information)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Prepare payload
      const payload = {
        basic_info: formData.basic_info,
        educations: formData.educations,
        experiences: formData.experiences,
        projects: formData.projects,
        skills: formData.skills,
        certifications: formData.certifications,
        volunteering: formData.volunteering
      };

      console.log('Sending payload to backend:', payload);

      // Send to backend
      const response = await api.post('/profiles/create-profile/', payload);
      
      console.log('Backend response:', response.data);
      
      // Clear localStorage on success
      localStorage.removeItem('profile_form_draft');
      
      setShowSuccessAlert(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
        window.location.reload(); // Force reload to fetch new profile data
      }, 2000);
    } catch (error) {
      console.error('Error submitting profile:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMsg = 'Failed to save profile. ';
      
      if (error.response?.status === 404) {
        errorMsg = '⚠️ Backend endpoint not found. The /api/profiles/create-profile/ endpoint needs to be created. See PHASE_3_BACKEND_GUIDE.md for implementation steps.';
      } else if (error.response?.status === 401) {
        errorMsg = 'Authentication required. Please log in again.';
      } else if (error.response?.data?.detail) {
        errorMsg += error.response.data.detail;
      } else if (error.message) {
        errorMsg += error.message;
      } else {
        errorMsg += 'Please try again.';
      }
      
      setErrorMessage(errorMsg);
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / 7) * 100;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Create Your Professional Profile</h1>
          <p className={styles.subtitle}>
            Tell us about your education, experience, and skills to get your Industry Readiness Score
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className={styles.progressText}>
          Step {currentStep} of 7 ({Math.round(progressPercentage)}%)
        </p>
      </div>

      {/* Alert Messages */}
      {showSuccessAlert && (
        <div className={styles.successAlert}>
          ✅ Profile saved successfully! Redirecting to dashboard...
        </div>
      )}
      
      {errorMessage && (
        <div className={styles.errorAlert}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <strong>❌ Error:</strong> {errorMessage}
            </div>
            <button 
              onClick={() => setErrorMessage('')}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#991b1b', 
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0 0.5rem',
                marginLeft: '1rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className={styles.formContent}>
        {currentStep === 1 && (
          <Step1_BasicInfo 
            data={formData.basic_info}
            onUpdate={updateBasicInfo}
          />
        )}
        
        {currentStep === 2 && (
          <Step2_Education 
            data={formData.educations}
            onUpdate={updateEducations}
          />
        )}
        
        {currentStep === 3 && (
          <Step3_Experience 
            data={formData.experiences}
            onUpdate={updateExperiences}
          />
        )}
        
        {currentStep === 4 && (
          <Step4_Projects 
            data={formData.projects}
            onUpdate={updateProjects}
          />
        )}
        
        {currentStep === 5 && (
          <Step5_Skills 
            data={formData.skills}
            onUpdate={updateSkills}
          />
        )}
        
        {currentStep === 6 && (
          <Step6_Certifications 
            data={formData.certifications}
            onUpdate={updateCertifications}
          />
        )}
        
        {currentStep === 7 && (
          <Step7_Review 
            data={formData}
            onEdit={(stepNumber) => setCurrentStep(stepNumber)}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className={styles.buttonContainer}>
        <button
          className={styles.btnSecondary}
          onClick={handlePrevious}
          disabled={currentStep === 1 || isLoading}
        >
          ← Previous
        </button>

        {currentStep < 7 ? (
          <button
            className={styles.btnPrimary}
            onClick={handleNext}
            disabled={isLoading}
          >
            Next →
          </button>
        ) : (
          <button
            className={`${styles.btnPrimary} ${styles.submitBtn}`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Saving Profile...' : '✅ Submit Profile'}
          </button>
        )}
      </div>

      {/* Save Draft Indicator */}
      <p className={styles.draftNote}>
        💾 Your profile is automatically saved as you fill it out
      </p>
    </div>
  );
}
