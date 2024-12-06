import { faBell, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import api from '../utils/api';
import BottomNav from './BottomNav';
import ConfirmationPopup from './ConfirmationPopup';
import './HomeScreen.css';
import MessagePopup from './MessagePopup';

const HomeScreen = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [hasReminders, setHasReminders] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const { activeTask, timer, formatTime } = useTask();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await api.get('/auth/user');
        console.log('User data response:', response.data);
        setUserData(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401 || error.response?.status === 404) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkReminders = async () => {
      try {
        const response = await api.get('/study');
        const tasks = response.data;
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Reset hours to start of day for comparison
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);

        const hasActiveReminders = tasks.some(task => {
          const taskDate = new Date(task.startTime);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime() || taskDate.getTime() === tomorrow.getTime();
        });

        setHasReminders(hasActiveReminders);
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };

    checkReminders();
    // Check for new reminders every minute
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get('study');
        setRecentActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setShowProfileMenu(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setShowLogoutSuccess(true);
    
    // Wait for the success message to show before actually logging out
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
    }, 1500);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false); // Close the dropdown
    navigate('/profile'); // Navigate to profile screen
  };

  const handleStudyClick = () => {
    navigate('/study'); // Navigate to study screen instead of showing AddTask modal
  };

  const handleProgressAnalyticsClick = () => {
    navigate('/analytics');  // Navigate to analytics screen
  };

  const handleGoalsClick = () => {
    navigate('/goals');  // Navigate to goals screen
  };

  const handleRemindersClick = () => {
    navigate('/reminders');  // Navigate to reminders screen
  };

  const handleOngoingTaskClick = () => {
    navigate('/study');
  };

  if (isLoading) {
    return (
      <div className="home-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      {success && <div className="success-message">{success}</div>}
      
      <header className="header-bar">
        <div className="header-content">
          <div className="header-label">Dashboard</div>
        </div>
        <div className="user-profile" ref={profileRef}>
          <button 
            className="user-icon"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <FontAwesomeIcon icon={faUser} />
          </button>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-info" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faUser} className="profile-dropdown-icon" />
                <div className="profile-details">
                  <span className="full-name">{userData?.fullName || 'Guest User'}</span>
                </div>
              </div>
    
            </div>
          )}
        </div>
      </header>

      <div className="search-section">
        <button className="search-icon">
          <FontAwesomeIcon icon={faSearch} />
        </button>
        <input type="text" placeholder="Search tasks..." className="search-bar" />
      </div>

      <main className="scrollable-content">
        <div className="feature-grid">
          <div className="feature-card" onClick={handleStudyClick}>
            <div className="feature-icon">📚</div>
            <h3>Study Tasks</h3>
            <p>Organize and track your study progress</p>
          </div>
          <div className="feature-card" onClick={handleProgressAnalyticsClick}>
            <div className="feature-icon">📊</div>
            <h3>Progress Analytics</h3>
            <p>Track your learning journey</p>
          </div>
          <div className="feature-card" onClick={handleGoalsClick}>
            <div className="feature-icon">🎯</div>
            <h3>Goals</h3>
            <p>Set and achieve your targets</p>
          </div>
          <div className="feature-card" onClick={handleRemindersClick}>
            <div className={`feature-icon ${hasReminders ? 'has-notifications' : ''}`}>
              {hasReminders ? (
                <FontAwesomeIcon icon={faBell} className="animated-bell" />
              ) : (
                '🔔'
              )}
              {hasReminders && <span className="notification-indicator"></span>}
            </div>
            <h3>Reminders</h3>
            <p>Stay on top of your schedule</p>
            {hasReminders && (
              <div className="reminder-alert">
                You have active reminders
              </div>
            )}
          </div>
        </div>

        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div key={activity._id} className="activity-item">
                <div className="activity-icon">📚</div>
                <div className="activity-details">
                  <h4>{activity.subject}</h4>
                  <p>{activity.notes}</p>
                  <p className="completion-time">
                    Completed in {activity.completedTime} minutes
                  </p>
                </div>
                <div className="activity-time">
                  {new Date(activity.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="no-activities">No recent activities</p>
            )}
          </div>
        </section>

        <section className="recent-activity">
          <h2>Ongoing Task</h2>
          <div className="activity-list">
            {activeTask ? (
              <div className="activity-item ongoing" onClick={handleOngoingTaskClick}>
                <div className="activity-icon">⏳</div>
                <div className="activity-details">
                  <h4>{activeTask.subject}</h4>
                  <p>{activeTask.title}</p>
                  <div className="ongoing-progress">
                    <div className="timer">{formatTime(timer)}</div>
                    <span className="time-remaining">
                      {Math.max(activeTask.duration - Math.floor(timer / 60), 0)} min remaining
                    </span>
                  </div>
                </div>
                <div className="activity-time">
                  In Progress
                </div>
              </div>
            ) : (
              <p className="no-activities">No ongoing tasks</p>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
      
      {showLogoutConfirm && (
        <ConfirmationPopup
          message="Do you want to continue?"
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

export default HomeScreen;
