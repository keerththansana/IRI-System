import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, jobAPI, readinessAPI } from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [readinessScores, setReadinessScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log('🔄 readinessScores state changed:', readinessScores);
    console.log('📊 readinessScores length:', readinessScores.length);
    console.log('🎯 selectedJob:', selectedJob);
  }, [readinessScores, selectedJob]);

  const normalizeList = (data) => {
    if (Array.isArray(data)) {
      return data;
    }
    return data?.results ?? [];
  };

  const loadData = async () => {
    try {
      console.log('Loading dashboard data...');
      
      // Fetch jobs first
      try {
        const jobsRes = await jobAPI.getJobs();
        console.log('✅ Jobs API response:', jobsRes.data);
        console.log('Jobs data type:', typeof jobsRes.data);
        console.log('Is array?', Array.isArray(jobsRes.data));
        
        const normalizedJobs = normalizeList(jobsRes.data);
        console.log('✅ Normalized jobs:', normalizedJobs);
        console.log('Job count:', normalizedJobs.length);
        
        setJobs(normalizedJobs);
      } catch (jobsError) {
        console.error('❌ Error loading jobs:', jobsError);
        console.error('❌ Jobs error details:', jobsError.response?.data);
        setJobs([]);
      }
      
      // Fetch profile
      try {
        const profileRes = await profileAPI.getProfile();
        console.log('Profile response:', profileRes.data);
        setProfile(profileRes.data);
      } catch (profileError) {
        console.error('Profile not found:', profileError);
        setProfile(null);
      }
      
      // Fetch scores if available
      try {
        const scoresRes = await readinessAPI.getScores();
        console.log('Scores response:', scoresRes.data);
        setReadinessScores(normalizeList(scoresRes.data));
      } catch (scoresError) {
        console.error('Scores not available:', scoresError);
        setReadinessScores([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedJob) return;
    
    setCalculating(true);
    try {
      console.log('🎯 Calculating readiness for job ID:', selectedJob);
      
      // Calculate for all three company levels
      const results = [];
      for (const level of ['startup', 'corporate', 'leading']) {
        try {
          console.log(`📡 Calling API for ${level}...`);
          const response = await readinessAPI.calculate(selectedJob, level);
          console.log(`✅ ${level} response:`, response.data);
          const scoreData = {
            job_role: selectedJob,
            company_level: level,
            score: response.data.iri_score ?? response.data.total_score ?? response.data.score ?? 0,
            details: response.data
          };
          console.log(`📊 Pushing score data for ${level}:`, scoreData);
          results.push(scoreData);
        } catch (error) {
          console.error(`❌ Error calculating ${level}:`, error);
          console.error(`Error details:`, error.response?.data);
        }
      }
      
      console.log('📈 All readiness scores (before setState):', results);
      console.log('📏 Results array length:', results.length);
      
      if (results.length > 0) {
        console.log('✅ Setting readiness scores with', results.length, 'items');
        setReadinessScores(results);
      } else {
        console.log('⚠️ No results to set - results array is empty');
      }
    } catch (error) {
      console.error('❌ Error calculating readiness:', error);
      alert('Error calculating readiness. Please make sure you have created your profile.');
    } finally {
      setCalculating(false);
    }
  };

  const isSelectedJobScore = (scoreItem, jobId) => {
    const scoreJobId = scoreItem?.job_role?.id ?? scoreItem?.job_role;
    const match = Number(scoreJobId) === Number(jobId);
    console.log(`🔍 isSelectedJobScore: scoreItem.job_role=${scoreItem?.job_role}, jobId=${jobId}, match=${match}`);
    return match;
  };

  const getScoreForJob = (jobId, level) => {
    const score = readinessScores.find(
      s => isSelectedJobScore(s, jobId) && s.company_level === level
    );
    return score ? Math.round(score.score) : 0;
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">IRI System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={() => navigate('/profile')}
                className="btn-secondary text-sm py-2 px-4"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Readiness Dashboard</h2>
          <p className="text-gray-600">Select a job role to calculate your industry readiness score</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Your Dream Job</h3>
              <select
                value={selectedJob || ''}
                onChange={(e) => {
                  const jobId = Number(e.target.value);
                  console.log('Selected job ID:', jobId);
                  setSelectedJob(jobId);
                }}
                className="input-field mb-4"
              >
                <option value="">Choose a job role...</option>
                {jobs.length === 0 && <option disabled>Loading jobs...</option>}
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.name}</option>
                ))}
              </select>

              <button
                onClick={handleCalculate}
                disabled={!selectedJob || calculating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {calculating ? 'Calculating...' : 'Calculate Readiness'}
              </button>
            </div>

            {selectedJob && (
              <div className="mt-6 space-y-6">
                {/* Scores Card */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Your Readiness Scores</h3>
                  
                  {readinessScores.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Click "Calculate Readiness" to see your scores</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {['startup', 'corporate', 'leading'].map(level => {
                        const scoreData = readinessScores.find(s => isSelectedJobScore(s, selectedJob) && s.company_level === level);
                        const score = scoreData?.score || 0;
                        const label = level.charAt(0).toUpperCase() + level.slice(1);
                        
                        console.log(`🎯 Rendering ${level}: scoreData=`, scoreData, 'score=', score);
                        
                        return (
                          <div key={level}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-semibold text-gray-700">{label}</span>
                              <span className="text-2xl font-bold" style={{ color: '#00547c' }}>{Math.round(score)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                style={{ 
                                  background: 'linear-gradient(90deg, #00547c 0%, #009b69 100%)',
                                  width: `${score}%`,
                                  height: '100%',
                                  borderRadius: '9999px',
                                  transition: 'width 0.5s ease'
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recommendations Card */}
                <div className="card bg-blue-50 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Recommendations</h3>
                  <div className="space-y-3">
                    {readinessScores.find(s => isSelectedJobScore(s, selectedJob))?.details?.recommendations ? (
                      Array.isArray(readinessScores.find(s => isSelectedJobScore(s, selectedJob)).details.recommendations) ? (
                        <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                          {readinessScores
                            .find(s => isSelectedJobScore(s, selectedJob))
                            .details.recommendations
                            .map((rec, idx) => (
                              <li key={idx}>{rec.suggestion || rec.area}</li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700">{readinessScores.find(s => isSelectedJobScore(s, selectedJob)).details.recommendations}</p>
                      )
                    ) : (
                      <div className="space-y-2 text-gray-700">
                        <p><strong>To improve your readiness:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Complete more projects related to this role</li>
                          <li>Gain relevant work experience through internships</li>
                          <li>Build a portfolio showcasing your skills</li>
                          <li>Obtain industry-recognized certifications</li>
                          <li>Participate in relevant workshops and training</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Strengths and Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card bg-green-50 border border-green-200">
                    <h4 className="font-bold text-gray-900 mb-3">✨ Your Strengths</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {profile?.profile_skills?.length > 0 && <li>✓ {profile.profile_skills.length} skills in your profile</li>}
                      {profile?.projects?.length > 0 && <li>✓ {profile.projects.length} project{profile.projects.length > 1 ? 's' : ''} completed</li>}
                      {profile?.certifications?.length > 0 && <li>✓ {profile.certifications.length} certification{profile.certifications.length > 1 ? 's' : ''} earned</li>}
                      {profile?.experiences?.length > 0 && <li>✓ {profile.experiences.length} work experience{profile.experiences.length > 1 ? 's' : ''}</li>}
                    </ul>
                  </div>
                  
                  <div className="card bg-orange-50 border border-orange-200">
                    <h4 className="font-bold text-gray-900 mb-3">🎯 Areas to Develop</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {(!profile?.profile_skills || profile.profile_skills.length < 5) && <li>• Add more relevant skills to your profile</li>}
                      {(!profile?.projects || profile.projects.length < 2) && <li>• Work on more projects to build experience</li>}
                      {(!profile?.certifications || profile.certifications.length === 0) && <li>• Obtain professional certifications</li>}
                      {(!profile?.experiences || profile.experiences.length === 0) && <li>• Gain industry experience through internships</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card" style={{ background: 'linear-gradient(135deg, #00547c 0%, #009b69 100%)', color: 'white' }}>
              <h3 className="text-lg font-bold mb-2">Profile Completion</h3>
              <p className="text-3xl font-bold">{profile?.full_name ? '85%' : '10%'}</p>
              <p className="text-sm" style={{ opacity: 0.9, marginTop: '0.5rem' }}>Complete your profile to improve accuracy</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Education</span>
                  <span className="font-semibold">{profile?.educations?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects</span>
                  <span className="font-semibold">{profile?.projects?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold">{profile?.experiences?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills</span>
                  <span className="font-semibold">{profile?.profile_skills?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certifications</span>
                  <span className="font-semibold">{profile?.certifications?.length || 0}</span>
                </div>
              </div>
            </div>

            {!profile?.full_name && (
              <div className="card bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ No profile found</strong><br/>
                  Please create your profile to see readiness scores.
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="btn-primary mt-3 w-full"
                >
                  Create Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Section */}
        {profile?.full_name && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>

            {/* LinkedIn-style Header */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center rounded-full text-white font-bold"
                    style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #00547c 0%, #009b69 100%)' }}
                  >
                    {getInitials(profile.full_name) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{profile.full_name}</h3>
                    {profile.headline && <p className="text-gray-700 mt-1">{profile.headline}</p>}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                      {profile.location && <span>{profile.location}</span>}
                      {profile.date_of_birth && <span>Born {profile.date_of_birth}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Education: {profile.educations?.length || 0}</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Experience: {profile.experiences?.length || 0}</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Projects: {profile.projects?.length || 0}</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Skills: {profile.profile_skills?.length || 0}</span>
                </div>
              </div>

              {profile.summary && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">About</p>
                  <p className="text-gray-900 mt-1">{profile.summary}</p>
                </div>
              )}
            </div>

            {/* Education */}
            {profile.educations && profile.educations.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎓 Education</h3>
                <div className="space-y-4">
                  {profile.educations.map((edu, idx) => (
                    <div key={idx} className="border-l-4 border-primary-500 pl-4 pb-4">
                      <h4 className="font-semibold text-gray-900">{edu.institution}</h4>
                      <p className="text-gray-600">{edu.field_of_study} - {edu.level}</p>
                      {edu.grade && <p className="text-sm text-gray-500">Grade: {edu.grade}</p>}
                      {edu.description && <p className="text-sm text-gray-600 mt-2">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experiences && profile.experiences.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">💼 Experience</h3>
                <div className="space-y-4">
                  {profile.experiences.map((exp, idx) => (
                    <div key={idx} className="border-l-4 border-accent-500 pl-4 pb-4">
                      <h4 className="font-semibold text-gray-900">{exp.role_title}</h4>
                      <p className="text-gray-600">{exp.company}</p>
                      {exp.is_current && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Current</span>}
                      {exp.description && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {profile.projects && profile.projects.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📂 Projects</h3>
                <div className="space-y-4">
                  {profile.projects.map((proj, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">{proj.title}</h4>
                      {proj.description && <p className="text-sm text-gray-600 mt-2">{proj.description}</p>}
                      {proj.technologies && <p className="text-xs text-gray-500 mt-2">Tech: {proj.technologies}</p>}
                      <div className="flex gap-2 mt-2">
                        {proj.github_link && (
                          <a href={proj.github_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                            GitHub
                          </a>
                        )}
                        {proj.live_link && (
                          <a href={proj.live_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {profile.profile_skills && profile.profile_skills.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.profile_skills.map((skillItem, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                      {skillItem.skill?.name || skillItem.name} {skillItem.proficiency && `(${skillItem.proficiency}/5)`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Certifications</h3>
                <div className="space-y-3">
                  {profile.certifications.map((cert, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                        <p className="text-sm text-gray-600">{cert.issuer}</p>
                      </div>
                      {cert.credential_url && (
                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                          View Certificate
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
