import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import BottomNav from './BottomNav';
import './RemindersScreen.css';

const RemindersScreen = () => {
  const [reminders, setReminders] = useState({ today: [], tomorrow: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/study');
        const tasks = response.data;
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Reset hours to start of day for comparison
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);

        const sortedTasks = {
          today: tasks.filter(task => {
            const taskDate = new Date(task.startTime);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
          }),
          tomorrow: tasks.filter(task => {
            const taskDate = new Date(task.startTime);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === tomorrow.getTime();
          })
        };

        setReminders(sortedTasks);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="reminders-screen">
      <header className="reminders-header">
        <div className="settings-header">
          <h1>Reminders</h1>
          <p className="settings-subtitle">Stay on top of your schedule</p>
        </div>
      </header>

      <div className="reminders-content">
        {isLoading ? (
          <p className="loading">Loading reminders...</p>
        ) : (
          <>
            {/* Today's Reminders */}
            <div className="reminder-section">
              <h2>Today's Schedule</h2>
              {reminders.today.length > 0 ? (
                <div className="reminder-list">
                  {reminders.today.map((task) => (
                    <div key={task._id} className="reminder-card">
                      <div className="reminder-icon animated">
                        <FontAwesomeIcon icon={faBell} />
                      </div>
                      <div className="reminder-details">
                        <h3>{task.notes || 'Untitled Task'}</h3>
                        <p className="reminder-subject">{task.subject}</p>
                        <p className="reminder-time">
                          Scheduled for: {formatTime(task.startTime)}
                        </p>
                        <p className="reminder-duration">
                          Duration: {task.duration} minutes
                        </p>
                      </div>
                      <div className="reminder-status">
                        <span className="status-indicator active">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reminders">No tasks scheduled for today</p>
              )}
            </div>

            {/* Tomorrow's Reminders */}
            <div className="reminder-section">
              <h2>Tomorrow's Schedule</h2>
              {reminders.tomorrow.length > 0 ? (
                <div className="reminder-list">
                  {reminders.tomorrow.map((task) => (
                    <div key={task._id} className="reminder-card">
                      <div className="reminder-icon">
                        <FontAwesomeIcon icon={faBell} />
                      </div>
                      <div className="reminder-details">
                        <h3>{task.notes || 'Untitled Task'}</h3>
                        <p className="reminder-subject">{task.subject}</p>
                        <p className="reminder-time">
                          Scheduled for: {formatTime(task.startTime)}
                        </p>
                        <p className="reminder-duration">
                          Duration: {task.duration} minutes
                        </p>
                      </div>
                      <div className="reminder-status">
                        <span className="status-indicator upcoming">Prepare</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reminders">No tasks scheduled for tomorrow</p>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default RemindersScreen; 