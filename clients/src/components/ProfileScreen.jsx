import { faCamera, faChartLine, faCheckCircle, faClock, faEdit, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import './ProfileScreen.css';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Mock milestone data (replace with real data later)
  const milestones = {
    tasksCompleted: 24,
    totalStudyHours: 45,
    streakDays: 7,
    averageScore: 85
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          setEditedName(parsedData.fullName);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('profileImage', file);

        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to upload image');
        }

        setUserData(data.user);
        localStorage.setItem('userData', JSON.stringify(data.user));
      } catch (error) {
        console.error('Error uploading profile image:', error);
        setUploadError(error.message || 'Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleNameUpdate = async () => {
    // Implement name update logic here
    setUserData({ ...userData, fullName: editedName });
    setIsEditing(false);
    // Update localStorage
    localStorage.setItem('userData', JSON.stringify({ ...userData, fullName: editedName }));
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <h1>Profile</h1>
        <p className="profile-subtitle">Customize your profile</p>
      </div>

      <div className="profile-content">
        <div className="profile-image-section">
          <div className="profile-image-container">
            {isUploading ? (
              <div className="profile-image-placeholder loading">
                <span>Uploading...</span>
              </div>
            ) : userData?.profileImage ? (
              <img 
                src={`${import.meta.env.VITE_BACKEND_URL}${userData.profileImage}`} 
                alt="Profile" 
                className="profile-image" 
              />
            ) : (
              <div className="profile-image-placeholder">
                {userData?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <label className="image-upload-label">
              <FontAwesomeIcon icon={faCamera} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden-input"
                disabled={isUploading}
              />
            </label>
          </div>
          {uploadError && (
            <div className="upload-error">
              {uploadError}
            </div>
          )}
        </div>

        <div className="profile-info-section">
          <div className="info-header">
            <h2>Account Info</h2>
          </div>
          
          <div className="info-content">
            <div className="info-field">
              <label>Full Name</label>
              {isEditing ? (
                <div className="edit-name-container">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="name-input"
                  />
                  <button onClick={handleNameUpdate} className="save-button">
                    Save
                  </button>
                </div>
              ) : (
                <div className="name-display">
                  <span>{userData?.fullName}</span>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="edit-button"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </div>
              )}
            </div>
            <div className="info-field">
              <label>Email</label>
              <span>{userData?.email}</span>
            </div>
          </div>
        </div>

        <div className="milestones-section">
          <h2>Your Milestones</h2>
          <div className="milestone-grid">
            <div className="milestone-card">
              <FontAwesomeIcon icon={faCheckCircle} className="milestone-icon" />
              <div className="milestone-value">{milestones.tasksCompleted}</div>
              <div className="milestone-label">Tasks Completed</div>
            </div>
            <div className="milestone-card">
              <FontAwesomeIcon icon={faClock} className="milestone-icon" />
              <div className="milestone-value">{milestones.totalStudyHours}h</div>
              <div className="milestone-label">Study Hours</div>
            </div>
            <div className="milestone-card">
              <FontAwesomeIcon icon={faTrophy} className="milestone-icon" />
              <div className="milestone-value">{milestones.streakDays} days</div>
              <div className="milestone-label">Current Streak</div>
            </div>
            <div className="milestone-card">
              <FontAwesomeIcon icon={faChartLine} className="milestone-icon" />
              <div className="milestone-value">{milestones.averageScore}%</div>
              <div className="milestone-label">Average Progress</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
