import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import './styles.css';

const AddTask = ({ 
  showAddTaskModal, 
  setShowAddTaskModal, 
  selectedDate, 
  subjects = [], 
  onAddTask,
  initialTask = null, 
  isEditing = false
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [subject, setSubject] = useState(initialTask?.subject || '');
  const [hours, setHours] = useState(
    initialTask ? Math.floor(initialTask.duration / 60).toString() : ''
  );
  const [minutes, setMinutes] = useState(
    initialTask ? (initialTask.duration % 60).toString() : ''
  );
  const [date, setDate] = useState(
    initialTask?.date ? new Date(initialTask.date) : new Date()
  );
  const [showCustomSubjectForm, setShowCustomSubjectForm] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customIcon, setCustomIcon] = useState('📚');
  const [customSubjects, setCustomSubjects] = useState([]);

  useEffect(() => {
    if (initialTask && isEditing) {
      setTitle(initialTask.title);
      setSubject(initialTask.subject);
      const totalMinutes = parseInt(initialTask.duration);
      setHours(Math.floor(totalMinutes / 60).toString());
      setMinutes((totalMinutes % 60).toString());
      setDate(new Date(initialTask.date));
    }
  }, [initialTask, isEditing]);

  useEffect(() => {
    // Fetch custom subjects when component mounts
    const fetchCustomSubjects = async () => {
      try {
        const response = await api.get('/api/subjects');
        setCustomSubjects(response.data);
      } catch (error) {
        console.error('Error fetching custom subjects:', error);
      }
    };
    
    fetchCustomSubjects();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const duration = (parseInt(hours || '0') * 60) + parseInt(minutes || '0');
    
    onAddTask({
      title,
      subject,
      duration,
      date
    });
    
    setShowAddTaskModal(false);
  };

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setHours('');
    setMinutes('');
    setDate(new Date());
    setShowAddTaskModal(false);
  };

  const handleAddCustomSubject = async () => {
    if (customSubject.trim()) {
      try {
        const response = await api.post('/api/subjects', {
          name: customSubject.trim(),
          icon: customIcon
        });
        
        setCustomSubjects(prev => [...prev, response.data]);
        setSubject(response.data.name);
        setShowCustomSubjectForm(false);
        setCustomSubject('');
        setCustomIcon('📚');
      } catch (error) {
        console.error('Error adding custom subject:', error);
      }
    }
  };

  if (!showAddTaskModal) return null;

  return (
    <div className="add-task-overlay">
      <div className="add-task-modal">
        <button className="close-button" onClick={resetForm}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <form onSubmit={handleSubmit}>
          <h2>{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
            required
          />
          <div className="select-container">
            <select
              value={subject}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomSubjectForm(true);
                } else {
                  setSubject(e.target.value);
                }
              }}
              required
              className="subject-select"
            >
              <option value="">Select Subject</option>
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.name}>
                  {subj.icon} {subj.name}
                </option>
              ))}
              {customSubjects.map((subj) => (
                <option key={subj._id} value={subj.name}>
                  {subj.icon} {subj.name}
                </option>
              ))}
              <option value="custom">+ Add Custom Subject</option>
            </select>
          </div>

          {showCustomSubjectForm && (
            <div className="custom-subject-form">
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter subject name"
                className="subject-input"
              />
              <select
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                className="icon-select"
              >
                <option value="📚">📚 Book</option>
                <option value="✏️">✏️ Pencil</option>
                <option value="🎨">🎨 Art</option>
                <option value="🎵">🎵 Music</option>
                <option value="🏃">🏃 Sports</option>
                <option value="🌍">🌍 Geography</option>
                <option value="🔬">🔬 Science</option>
                <option value="🧮">🧮 Math</option>
                <option value="💻">💻 Computer</option>
                <option value="🗣️">🗣️ Language</option>
              </select>
              <div className="custom-subject-buttons">
                <button
                  type="button"
                  className="confirm-subject-btn"
                  onClick={handleAddCustomSubject}
                >
                  Add Subject
                </button>
                <button
                  type="button"
                  className="cancel-subject-btn"
                  onClick={() => {
                    setShowCustomSubjectForm(false);
                    setCustomSubject('');
                    setCustomIcon('📚');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="duration-input">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Hours"
              min="0"
            />
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Minutes"
              min="0"
              max="59"
            />
          </div>
          <input
            type="date"
            value={date.toISOString().split('T')[0]}
            onChange={(e) => setDate(new Date(e.target.value))}
            required
          />
          <button type="submit">
            <FontAwesomeIcon icon={faPlus} />
            {isEditing ? 'Update Task' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
