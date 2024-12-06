import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faCheck, 
  faClock, 
  faBookOpen, 
  faCalendarCheck,
  faChevronDown,
  faChevronUp,
  faTrophy,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import BottomNav from './BottomNav';
import api from '../utils/api';
import './GoalsScreen.css';

const GoalsScreen = () => {
  const [goals, setGoals] = useState({
    daily: {
      tasksAdded: 0,
      tasksCompleted: 0,
      studySessionsCompleted: 0,
      goalsCompleted: {
        addTask: false,
        completeTask: false,
        completeStudySession: false
      }
    },
    weekly: {
      totalStudyHours: 0,
      uniqueSubjects: 0,
      studyDays: 0,
      goalsCompleted: {
        studyHours: false,
        uniqueSubjects: false,
        activeDays: false
      }
    }
  });

  const [sections, setSections] = useState({
    completed: true,
    daily: true,
    weekly: true
  });

  const toggleSection = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCompletedGoals = () => {
    const completed = [];
    
    // Check daily goals
    if (goals.daily.goalsCompleted.addTask) {
      completed.push({ 
        type: 'daily', 
        name: 'Add a Task', 
        icon: faPlus,
        completedAt: new Date().toLocaleDateString()
      });
    }
    if (goals.daily.goalsCompleted.completeTask) {
      completed.push({ 
        type: 'daily', 
        name: 'Complete a Task', 
        icon: faCheck,
        completedAt: new Date().toLocaleDateString()
      });
    }
    if (goals.daily.goalsCompleted.completeStudySession) {
      completed.push({ 
        type: 'daily', 
        name: 'Study Session (25+ mins)', 
        icon: faClock,
        completedAt: new Date().toLocaleDateString()
      });
    }

    // Check weekly goals
    if (goals.weekly.goalsCompleted.studyHours) {
      completed.push({ 
        type: 'weekly', 
        name: 'Study Hours', 
        icon: faClock,
        completedAt: new Date().toLocaleDateString()
      });
    }
    if (goals.weekly.goalsCompleted.uniqueSubjects) {
      completed.push({ 
        type: 'weekly', 
        name: 'Subject Variety', 
        icon: faBookOpen,
        completedAt: new Date().toLocaleDateString()
      });
    }
    if (goals.weekly.goalsCompleted.activeDays) {
      completed.push({ 
        type: 'weekly', 
        name: 'Active Days', 
        icon: faCalendarCheck,
        completedAt: new Date().toLocaleDateString()
      });
    }

    return completed;
  };

  useEffect(() => {
    const fetchGoalStats = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dailyStats = await api.get('/goals/daily', {
          params: {
            date: today.toISOString()
          }
        });

        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const weeklyStats = await api.get('/goals/weekly', {
          params: {
            startDate: startOfWeek.toISOString()
          }
        });

        setGoals({
          daily: dailyStats.data,
          weekly: weeklyStats.data
        });
      } catch (error) {
        console.error('Error fetching goal stats:', error);
      }
    };

    fetchGoalStats();
    const interval = setInterval(fetchGoalStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const completedGoals = getCompletedGoals();

  return (
    <div className="goals-screen">
      <div className="goals-header">
        <h1>Goals</h1>
        <p className="settings-subtitle">Track your daily and weekly achievements</p>
      </div>

      <div className="goals-content">
        {completedGoals.length > 0 && (
          <div className="goals-section completed-goals-section">
            <div className="section-header" onClick={() => toggleSection('completed')}>
              <div className="section-title">
                <FontAwesomeIcon icon={faTrophy} className="section-icon" />
                <h2>Completed Goals</h2>
              </div>
              <FontAwesomeIcon 
                icon={sections.completed ? faChevronUp : faChevronDown} 
                className="toggle-icon" 
              />
            </div>
            {sections.completed && (
              <div className="section-content">
                {completedGoals.map((goal, index) => (
                  <div key={index} className="goal-item completed">
                    <div className="goal-icon-title">
                      <FontAwesomeIcon icon={goal.icon} className="goal-type-icon" />
                      <h3>{goal.name}</h3>
                      <FontAwesomeIcon icon={faStar} className="completed-star" />
                    </div>
                    <p className="goal-type">{goal.type === 'daily' ? 'Daily Goal' : 'Weekly Goal'}</p>
                    <p className="completed-date">Completed on {goal.completedAt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="goals-section">
          <div className="section-header" onClick={() => toggleSection('daily')}>
            <div className="section-title">
              <h2>Daily Goals</h2>
            </div>
            <FontAwesomeIcon 
              icon={sections.daily ? faChevronUp : faChevronDown} 
              className="toggle-icon" 
            />
          </div>
          {sections.daily && (
            <div className="section-content">
              {!goals.daily.goalsCompleted.addTask && (
                <div className="goal-item">
                  <div className="goal-icon-title">
                    <FontAwesomeIcon icon={faPlus} className="goal-type-icon" />
                    <h3>Add a Task</h3>
                  </div>
                  <p>Pending</p>
                </div>
              )}
              {!goals.daily.goalsCompleted.completeTask && (
                <div className="goal-item">
                  <div className="goal-icon-title">
                    <FontAwesomeIcon icon={faCheck} className="goal-type-icon" />
                    <h3>Complete a Task</h3>
                  </div>
                  <p>Pending</p>
                </div>
              )}
              {!goals.daily.goalsCompleted.completeStudySession && (
                <div className="goal-item">
                  <div className="goal-icon-title">
                    <FontAwesomeIcon icon={faClock} className="goal-type-icon" />
                    <h3>Study Session (25+ mins)</h3>
                  </div>
                  <p>Pending</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="goals-section">
          <div className="section-header" onClick={() => toggleSection('weekly')}>
            <div className="section-title">
              <h2>Weekly Goals</h2>
            </div>
            <FontAwesomeIcon 
              icon={sections.weekly ? faChevronUp : faChevronDown} 
              className="toggle-icon" 
            />
          </div>
          {sections.weekly && (
            <div className="section-content">
              {!goals.weekly.goalsCompleted.studyHours && (
                <div className="goal-item">
                  <div className="goal-icon-title">
                    <FontAwesomeIcon icon={faClock} className="goal-type-icon" />
                    <h3>Study Hours</h3>
                  </div>
                  <p>Progress: {goals.weekly.totalStudyHours} / 10 hours</p>
                </div>
              )}
              {!goals.weekly.goalsCompleted.uniqueSubjects && (
                <div className="goal-item">
                  <div className="goal-icon-title">
                    <FontAwesomeIcon icon={faBookOpen} className="goal-type-icon" />
                    <h3>Subject Variety</h3>
                  </div>
                  <p>Progress: {goals.weekly.uniqueSubjects} / 3 subjects</p>
                </div>
              )}
              {!goals.weekly.goalsCompleted.activeDays && (
                <div className="goal-item">
                  <div className="goal-icon-title">
                    <FontAwesomeIcon icon={faCalendarCheck} className="goal-type-icon" />
                    <h3>Active Days</h3>
                  </div>
                  <p>Progress: {goals.weekly.studyDays} / 5 days</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default GoalsScreen;