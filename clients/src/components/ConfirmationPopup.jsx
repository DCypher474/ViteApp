import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <>
      <div className="message-overlay" onClick={onCancel} />
      <div className="message-container">
        <div className="message-icon" style={{ background: '#2196f3' }}>
          <FontAwesomeIcon icon={faQuestion} />
        </div>
        <div className="message-title" style={{ color: '#2196f3' }}>
          Confirm Logout
        </div>
        <div className="message-text">{message}</div>
        <div className="confirmation-buttons">
          <button 
            className="message-button cancel-button" 
            onClick={onCancel}
            style={{ marginRight: '10px', borderColor: '#666', color: '#666' }}
          >
            No
          </button>
          <button 
            className="message-button confirm-button" 
            onClick={onConfirm}
            style={{ borderColor: '#2196f3', color: '#2196f3' }}
          >
            Yes
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmationPopup; 