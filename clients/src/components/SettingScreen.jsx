import { faBell, faMoon, faPalette, faShare, faShield, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import ConfirmationPopup from './ConfirmationPopup';
import MessagePopup from './MessagePopup';
import './SettingScreen.css';

const SettingScreen = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }

    // Add navigation listener
    const handleNavigation = () => {
      setIsSliding(true);
      setTimeout(() => {
        setIsSliding(false);
      }, 300); // Match animation duration
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setShowLogoutSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleShareApp = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'StudyFlow',
          text: 'Check out StudyFlow - Transform Your Study Habits, Elevate Your Success!',
          url: window.location.origin
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.origin);
        alert('App link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-subtitle">Customize your experience</p>
      </div>

      <div className={`settings-content ${isSliding ? 'sliding-out' : ''}`}>
        <div className="settings-section">
          <h2>Account</h2>
          <div className="setting-item">
            <div className="setting-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="setting-info">
              <h3>Profile Settings</h3>
              <p>Update your personal information</p>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <div className="setting-icon">
              <FontAwesomeIcon icon={faMoon} />
            </div>
            <div className="setting-info">
              <h3>Dark Mode</h3>
              <p>Toggle dark theme</p>
            </div>
            <div className="setting-action">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-icon">
              <FontAwesomeIcon icon={faPalette} />
            </div>
            <div className="setting-info">
              <h3>Theme</h3>
              <p>Customize app appearance</p>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <div className="setting-icon">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div className="setting-info">
              <h3>Push Notifications</h3>
              <p>Manage notification preferences</p>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Privacy & Security</h2>
          <div className="setting-item">
            <div className="setting-icon">
              <FontAwesomeIcon icon={faShield} />
            </div>
            <div className="setting-info">
              <h3>Privacy Settings</h3>
              <p>Manage your privacy preferences</p>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>More</h2>
          <div className="setting-item" onClick={handleShareApp}>
            <div className="setting-icon">
              <FontAwesomeIcon icon={faShare} />
            </div>
            <div className="setting-info">
              <h3>Share App</h3>
              <p>Share StudyFlow with friends</p>
            </div>
          </div>
          <div className="setting-item" onClick={handleLogoutClick}>
            <div className="setting-icon logout-icon">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            <div className="setting-info">
              <h3>Logout</h3>
              <p>Sign out of your account</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      {showLogoutConfirm && (
        <ConfirmationPopup
          message="Are you sure you want to logout?"
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}

      {showLogoutSuccess && (
        <MessagePopup
          type="success"
          message="Logged out successfully!"
          onClose={() => setShowLogoutSuccess(false)}
        />
      )}
    </div>
  );
};

export default SettingScreen;
