import api from './api';

/**
 * Profile Service - Handle all profile-related API calls
 * 
 * Manages:
 * - Profile creation
 * - Profile retrieval
 * - Profile updates
 * - Readiness calculations
 */

export const profileService = {
  /**
   * Create a new student profile with all data
   * @param {Object} profileData - Complete profile data from form
   * @returns {Promise<Object>} - Created profile response
   */
  createProfile: async (profileData) => {
    try {
      const response = await api.post('/profiles/create-profile/', {
        basic_info: profileData.basic_info,
        educations: profileData.educations,
        experiences: profileData.experiences,
        projects: profileData.projects,
        skills: profileData.skills,
        certifications: profileData.certifications,
        volunteering: profileData.volunteering || []
      });
      return response.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  /**
   * Get student's profile
   * @returns {Promise<Object>} - Student profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/profiles/my-profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Update existing profile
   * @param {number} profileId - Profile ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated profile response
   */
  updateProfile: async (profileId, updateData) => {
    try {
      const response = await api.put(`/profiles/${profileId}/`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Get readiness score for a student
   * @returns {Promise<Object>} - Readiness calculation results
   */
  getReadinessScore: async () => {
    try {
      const response = await api.get('/readiness/calculate/');
      return response.data;
    } catch (error) {
      console.error('Error getting readiness score:', error);
      throw error;
    }
  },

  /**
   * Get all job roles for comparison
   * @returns {Promise<Array>} - List of job roles
   */
  getJobRoles: async () => {
    try {
      const response = await api.get('/jobs/all_jobs/');
      return response.data;
    } catch (error) {
      console.error('Error fetching job roles:', error);
      throw error;
    }
  },

  /**
   * Request verification (referral email)
   * @param {number} itemId - Item to verify (experience/education/project)
   * @param {string} itemType - Type of item (experience, education, project)
   * @param {string} contactEmail - Email to send verification to
   * @returns {Promise<Object>} - Verification request response
   */
  requestVerification: async (itemId, itemType, contactEmail) => {
    try {
      const response = await api.post('/verification/request-verification/', {
        item_id: itemId,
        item_type: itemType,
        contact_email: contactEmail
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting verification:', error);
      throw error;
    }
  },

  /**
   * Get skill suggestions from AI
   * @param {string} jobRole - Target job role
   * @returns {Promise<Array>} - Suggested skills
   */
  getSkillSuggestions: async (jobRole) => {
    try {
      const response = await api.get('/profiles/skill-suggestions/', {
        params: { job_role: jobRole }
      });
      return response.data.suggestions;
    } catch (error) {
      console.error('Error getting skill suggestions:', error);
      throw error;
    }
  }
};

export default profileService;
