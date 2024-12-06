import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartupScreen.css';

const StartupScreen = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showInitialAnimation, setShowInitialAnimation] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Hide initial animation after 2 seconds
    const timer = setTimeout(() => {
      setShowInitialAnimation(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const titles = [
    "StudyFlow",
    "Track Your Progress",
    "Set Your Goals",
    "Stay Organized"
  ];

  const descriptions = [
    "Transform Your Study Habits, Elevate Your Success",
    "Monitor your study hours and achievements",
    "Create and achieve your study objectives",
    "Manage your study schedule effectively"
  ];

  const icons = ["📚", "📊", "🎯", "📅"];

  const handleNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Start fade out animation
    const content = document.querySelector('.startup-content');
    content.querySelectorAll('.logo-container, .slogan, .features').forEach(el => {
      el.classList.add('fade-out');
    });

    // Wait for animation to complete
    setTimeout(() => {
      if (currentFrame === titles.length - 1) {
        navigate('/signup');
      } else {
        setCurrentFrame(prev => prev + 1);
        // Remove fade-out class and add fade-in
        content.querySelectorAll('.logo-container, .slogan, .features').forEach(el => {
          el.classList.remove('fade-out');
          el.classList.add('fade-in');
        });
      }
      setIsAnimating(false);
    }, 300); // Match animation duration
  };

  const handleSkip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const content = document.querySelector('.startup-content');
    content.querySelectorAll('.logo-container, .slogan, .features').forEach(el => {
      el.classList.add('fade-out');
    });

    setTimeout(() => {
      navigate('/signup');
    }, 300);
  };

  return (
    <div className="startup-container">
      {showInitialAnimation ? (
        <div className="initial-animation">
          <div className="logo-animation">
            <span className="book-icon">📚</span>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="startup-content">
          <div className="frame-indicator">
            {titles.map((_, index) => (
              <div 
                key={index} 
                className={`indicator-dot ${index === currentFrame ? 'active' : ''}`}
              />
            ))}
          </div>

          <div className="logo-container">
            <div className="logo">{icons[currentFrame]}</div>
            <h1 className="app-name">{titles[currentFrame]}</h1>
          </div>
          
          <h2 className="slogan">{descriptions[currentFrame]}</h2>
          
          {currentFrame > 0 && (
            <div className="features">
              <div className="feature-item">
                <span className="feature-icon">⏰</span>
                <span className="feature-text">Smart Study Planning</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Progress Analytics</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span className="feature-text">Goal Tracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔔</span>
                <span className="feature-text">Study Reminders</span>
              </div>
            </div>
          )}

          <div className="button-container">
            {currentFrame > 0 && (
              <button 
                className="skip-btn" 
                onClick={handleSkip}
                disabled={isAnimating}
              >
                Skip
              </button>
            )}
            <button 
              className="get-started-btn" 
              onClick={handleNext}
              disabled={isAnimating}
            >
              {currentFrame === 0 ? 'Get Started' : (currentFrame === titles.length - 1 ? 'Finish' : 'Next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupScreen;
