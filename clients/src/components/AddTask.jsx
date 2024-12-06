import React, { useState } from 'react';
import api from '../utils/api'; // Assuming you have an api module
import './AddTask.css';

const AddTask = ({ showAddTaskModal, setShowAddTaskModal, onTaskAdded }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📚');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showSuccess, setShowSuccess] = useState(false);

  const icons = [
    { emoji: '📚', label: 'Books' },
    { emoji: '📐', label: 'Math' },
    { emoji: '⚡', label: 'Physics' },
    { emoji: '🧪', label: 'Chemistry' },
    { emoji: '🧬', label: 'Biology' },
    { emoji: '🔤', label: 'Language' },
    { emoji: '💾', label: 'Database' },
    { emoji: '💻', label: 'Programming' },
    { emoji: '🎨', label: 'Art' },
    { emoji: '🌍', label: 'Geography' },
    { emoji: '📜', label: 'History' },
    { emoji: '✏️', label: 'Writing' },
    { emoji: '🎵', label: 'Music' },
    { emoji: '🏃', label: 'Sports' },
    { emoji: '🧮', label: 'Calculus' },
    { emoji: '🗺️', label: 'Maps' },
    { emoji: '🔬', label: 'Science' },
    { emoji: '📱', label: 'Technology' }
  ];

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
    setShowIconPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const totalMinutes = (parseInt(hours || '0') * 60) + parseInt(minutes || '0');
      
      // Convert date to Singapore timezone
      const sgDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
      
      const taskData = {
        title,
        subject: `${selectedIcon} ${subject}`,
        duration: totalMinutes,
        startTime: sgDate.toISOString(), // Use Singapore timezone
        status: 'pending',
        notes: title,
        progress: 0
      };

      const response = await api.post('/study', taskData);
      
      if (response.data) {
        await onTaskAdded();
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          setIsClosing(true);
          
          setTimeout(() => {
            setShowAddTaskModal(false);
            setIsClosing(false);
            // Reset form
            setTitle('');
            setSubject('');
            setSelectedIcon('📚');
            setHours('');
            setMinutes('');
            setDate(new Date());
          }, 300);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowAddTaskModal(false);
      setIsClosing(false);
      setTitle('');
      setSubject('');
      setSelectedIcon('📚');
      setHours('');
      setMinutes('');
      setDate(new Date());
    }, 300);
  };

  if (!showAddTaskModal && !isClosing) {
    return null;
  }

  return (
    <div className={`add-task-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      {showSuccess && (
        <div className="success-popup">
          <div className="success-content">
            <span className="success-icon">✅</span>
            Task added successfully!
          </div>
        </div>
      )}
      <div 
        className={`add-task-modal ${isClosing ? 'closing' : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title">Add New Task</h2>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div className="subject-input-container">
                <button
                  type="button"
                  className="icon-select-button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                >
                  {selectedIcon}
                </button>
                <input
                  type="text"
                  placeholder="Enter Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="subject-input"
                />
              </div>
              {showIconPicker && (
                <div className="icon-picker">
                  {icons.map((icon) => (
                    <button
                      key={icon.emoji}
                      type="button"
                      className="icon-option"
                      onClick={() => {
                        setSelectedIcon(icon.emoji);
                        setShowIconPicker(false);
                      }}
                      title={icon.label}
                    >
                      {icon.emoji}
                      <span className="icon-label">{icon.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Duration</label>
              <div className="duration-inputs">
                <div className="duration-input-group">
                  <input
                    type="number"
                    placeholder="0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    min="0"
                    className="duration-input"
                  />
                  <span className="duration-label">hrs</span>
                </div>
                <div className="duration-input-group">
                  <input
                    type="number"
                    placeholder="0"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    min="0"
                    max="59"
                    className="duration-input"
                  />
                  <span className="duration-label">min</span>
                </div>
              </div>
            </div>

            <div className="form-group date-group">
              <label>Date</label>
              <input
                type="date"
                value={date.toISOString().split('T')[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                required
                className="date-input"
              />
            </div>

            <div className="button-group">
              <button type="submit" className="add-task-button">
                Add Task
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTask;
