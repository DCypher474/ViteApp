import { faCalendar, faHourglassHalf, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import './NotificationPanel.css';

const NotificationPanel = ({ notifications, onClose, onNotificationClick }) => {
  const groupNotifications = () => {
    return {
      current: notifications.filter(n => n.type === 'current'),
      upcoming: notifications.filter(n => n.type === 'upcoming'),
      other: notifications.filter(n => n.type === 'other')
    };
  };

  const grouped = groupNotifications();

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      {Object.entries(grouped).map(([type, items]) => (
        items.length > 0 && (
          <div key={type} className="notification-group">
            <h4>{type.charAt(0).toUpperCase() + type.slice(1)} Tasks</h4>
            {items.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : ''}`}
                onClick={() => onNotificationClick(notification)}
              >
                <div className="notification-icon">
                  <FontAwesomeIcon 
                    icon={notification.type === 'current' ? faHourglassHalf : faCalendar} 
                  />
                </div>
                <div className="notification-content">
                  <p className="notification-text">{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ))}
      
      {notifications.length === 0 && (
        <div className="no-notifications">
          <p>No new notifications</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel; 