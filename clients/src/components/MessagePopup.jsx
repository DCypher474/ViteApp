import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const MessagePopup = ({ type, message, onClose }) => {
  return (
    <>
      <div className="message-overlay" onClick={onClose} />
      <div className={`message-container ${type}`}>
        <div className="message-icon">
          <FontAwesomeIcon icon={faCheck} />
        </div>
        <div className="message-title">
          Yeah!
        </div>
        <div className="message-text">{message}</div>
        <button className="message-button" onClick={onClose}>
          Done
        </button>
      </div>
    </>
  );
};

export default MessagePopup; 