import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const MessagePopup = ({ type, message, onClose }) => {
  return (
    <div className="message-popup-overlay">
      <div className={`message-popup ${type}`}>
        <div className="message-icon">
          <FontAwesomeIcon icon={type === 'success' ? faCheck : faTimes} />
        </div>
        <h2>{type === 'success' ? 'Yeah!' : 'Oh no!'}</h2>
        <p>{message}</p>
        <button onClick={onClose}>
          {type === 'success' ? 'Done' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default MessagePopup; 
