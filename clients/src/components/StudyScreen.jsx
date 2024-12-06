import { faChevronDown, faChevronLeft, faChevronRight, faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import api from '../utils/api';
import AddTask from './AddTask.jsx';
import BottomNav from './BottomNav';
import './StudyScreen.css';

const StudyScreen = () => {
  const navigate = useNavigate();
  const { activeTask, startTask, stopTask } = useTask();
  
  const [showDate, setShowDate] = useState(true);

  const [subjects] = useState([
    { id: 1, name: 'Mathematics', icon: '📐' },
    { id: 2, name: 'Physics', icon: '⚡' },
    { id: 3, name: 'Chemistry', icon: '🧪' },
    { id: 4, name: 'Biology', icon: '🧬' },
    { id: 5, name: 'Literature', icon: '📚' }
  ]);
  
  const [studyTasks, setStudyTasks] = useState([]);
  
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateConfirm, setShowDateConfirm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedDateTasks, setSelectedDateTasks] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    taskId: null
  });
  const [editingTask, setEditingTask] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        console.log('Fetching tasks...'); // Debug log
        const response = await api.get('/study');
        console.log('Response:', response.data); // Debug log

        if (response.data) {
          const validTasks = response.data.map(task => ({
            _id: task._id,
            notes: task.notes || 'Untitled Task',
            subject: task.subject || 'No Subject',
            duration: task.duration || 0,
            startTime: task.startTime || new Date(),
            status: task.status || 'pending',
            progress: task.progress || 0
          }));
          setStudyTasks(validTasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchTasks();
  }, [navigate]);

  // Transform tasks for display
  const upcomingTasks = studyTasks.map(task => ({
    id: task._id,
    title: task.notes || 'Untitled Task',
    subject: task.subject,
    duration: task.duration,
    date: new Date(task.startTime),
    progress: task.progress || 0,
    status: task.status
  }));

  // Add a function to refresh tasks
  const refreshTasks = async () => {
    try {
      const response = await api.get('/study');
      if (response.data) {
        const validTasks = response.data.map(task => ({
          _id: task._id,
          notes: task.notes || 'Untitled Task',
          subject: task.subject || 'No Subject',
          duration: task.duration || 0,
          startTime: task.startTime || new Date(),
          status: task.status || 'pending',
          progress: task.progress || 0
        }));
        setStudyTasks(validTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Pass refreshTasks to AddTask component
  const handleAddNewTask = async (newTask) => {
    await refreshTasks();
  };

  // Function to check if a date is today using Singapore timezone
  const isToday = (date) => {
    const today = new Date();
    const taskDate = new Date(date);
    const sgToday = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    const sgTaskDate = new Date(taskDate.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    
    return (
      sgTaskDate.getDate() === sgToday.getDate() &&
      sgTaskDate.getMonth() === sgToday.getMonth() &&
      sgTaskDate.getFullYear() === sgToday.getFullYear()
    );
  };

  // Format the date and time in Singapore timezone
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      timeZone: 'Asia/Singapore',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDeleteTask = async (taskId) => {
    try {
      console.log('Attempting to delete task with ID:', taskId); // Debug log
      
      // Make sure the authorization header is set
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Explicitly set the headers
      const response = await api.delete(`/study/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response:', response); // Debug log

      if (response.status === 200) {
        setStudyTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      console.error('Error details:', error.response?.data); // Additional error details
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleStartTask = (taskId) => {
    const task = studyTasks.find(t => t._id === taskId);
    if (task) {
      startTask({
        id: task._id,
        title: task.notes || 'Untitled Task',
        subject: task.subject,
        duration: task.duration
      });
      
      setStudyTasks(prevTasks =>
        prevTasks.map(t =>
          t._id === taskId
            ? { ...t, status: 'in-progress' }
            : t
        )
      );
    }
  };

  useEffect(() => {
    const total = studyTasks.reduce((acc, task) => acc + Number(task.duration), 0);
    const completed = studyTasks.filter(task => task.progress === 100).length;
    setTotalStudyTime(total);
    setCompletedTasks(completed);
  }, [studyTasks]);

  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];
    
    // Add previous month's days
    for (let i = firstDay.getDay(); i > 0; i--) {
      const date = new Date(year, month, -i + 1);
      dates.push({ date, isCurrentMonth: false, hasTask: false });
    }
    
    // Add current month's days
    for (let date = 1; date <= lastDay.getDate(); date++) {
      const currentDate = new Date(year, month, date);
      const hasTask = studyTasks.some(task => {
        const taskDate = new Date(task.startTime);
        return taskDate.toDateString() === currentDate.toDateString();
      });
      dates.push({
        date: currentDate,
        isCurrentMonth: true,
        hasTask
      });
    }
    
    // Add next month's days to complete the grid
    const remainingDays = 42 - dates.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      dates.push({ date, isCurrentMonth: false, hasTask: false });
    }
    
    return dates;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    const tasksForDate = studyTasks.filter(task => {
      const taskDate = new Date(task.startTime);
      return taskDate.toDateString() === date.toDateString();
    });

    if (tasksForDate.length > 0) {
      setSelectedDateTasks({
        date: date,
        tasks: tasksForDate.map(task => ({
          id: task._id,
          title: task.notes || 'Untitled Task',
          subject: task.subject,
          duration: task.duration,
          date: new Date(task.startTime),
          progress: task.progress || 0,
          status: task.status
        }))
      });
    } else {
      setSelectedDateTasks(null);
    }
  };

  const handleDateConfirm = () => {
    setShowDateConfirm(false);
    setShowAddTaskModal(true);
  };

  const formatCurrentDate = () => {
    const today = new Date();
    return {
      day: today.getDate(),
      weekday: today.toLocaleDateString('en-US', { weekday: 'short' }),
      month: today.toLocaleDateString('en-US', { month: 'short' }),
      year: today.getFullYear()
    };
  };

  const currentDate = formatCurrentDate();

  const handleNavigation = (path) => {
    setIsLeaving(true);
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  const separateTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      currentTasks: studyTasks.filter(task => {
        const taskDate = new Date(task.startTime);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      }),
      upcomingTasks: studyTasks.filter(task => {
        const taskDate = new Date(task.startTime);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() > today.getTime();
      }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    };
  };

  const { currentTasks, upcomingTasks: originalUpcomingTasks } = separateTasks();

  const handleEditTask = async (editedTask) => {
    try {
      const response = await api.put(`/study/${editedTask.id}`, {
        subject: editedTask.subject,
        duration: parseInt(editedTask.duration),
        startTime: new Date(editedTask.date).toISOString(),
        notes: editedTask.title
      });
      
      setStudyTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === editedTask.id ? response.data : task
        )
      );

      return response.data;
    } catch (error) {
      console.error('Error editing task:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      throw error;
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      const completedTaskData = stopTask();
      
      setStudyTasks(prevTasks => 
        prevTasks.filter(task => task._id !== taskId)
      );

      const activityData = {
        type: 'study',
        subject: completedTaskData.subject,
        notes: completedTaskData.title,
        completedTime: completedTaskData.completedTime,
        timestamp: new Date()
      };
      
      await api.post('/activities', activityData);
      await api.put(`/study/${taskId}`, {
        status: 'completed',
        progress: 100,
        completedTime: completedTaskData.completedTime
      });

    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      console.log('Updating task:', taskId, updatedData);
      const response = await api.patch(`/study/${taskId}`, {
        ...updatedData,
        userId: activeTask?.userId // Make sure we have the userId
      });
      
      if (response.status === 200) {
        setStudyTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === taskId ? { ...task, ...updatedData } : task
          )
        );
        setEditModalOpen(false);
        setEditingTask(null);
        setSelectedSubject('');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const TaskCard = ({ task, onStart, onDelete }) => {
    const handleEditClick = () => {
      setEditingTask({
        _id: task.id,
        title: task.title,
        subject: task.subject,
        duration: task.duration,
        date: task.date
      });
      setEditModalOpen(true);
    };

    return (
      <div className="task-card">
        <div className="task-info">
          <h3>{task.title}</h3>
          <p>{task.subject}</p>
          <p>Duration: {task.duration} minutes</p>
          <p>{new Date(task.date).toLocaleDateString()}</p>
        </div>
        <div className="task-actions">
          {isToday(task.date) && (
            <button className="start-button" onClick={() => onStart(task.id)}>
              Start Task
            </button>
          )}
          <button className="edit-button" onClick={handleEditClick}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button 
            className="delete-button" 
            onClick={() => setDeleteConfirmation({ show: true, taskId: task.id })}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    if (!studyTasks || studyTasks.length === 0) {
      return <div className="no-tasks">No tasks available</div>;
    }

    return studyTasks.map(task => (
      <div key={task._id} className="task-item">
        <div className="task-info">
          <h3>{task.notes || 'Untitled Task'}</h3>
          <p>{task.subject || 'No Subject'}</p>
          <p>Duration: {task.duration || 0} minutes</p>
          <p>
            {task.startTime 
              ? new Date(task.startTime).toLocaleDateString()
              : 'No date set'
            }
          </p>
        </div>
        <div className="task-actions">
          {task.startTime && isToday(task.startTime) && (
            <button 
              className="start-button"
              onClick={() => handleStartTask(task._id)}
            >
              Start Task
            </button>
          )}
          <button 
            className="edit-button"
            onClick={() => {
              setEditingTask({
                _id: task._id,
                title: task.notes || '',
                subject: task.subject || '',
                duration: task.duration || 0,
                date: task.startTime || new Date()
              });
              setEditModalOpen(true);
            }}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button 
            className="delete-button"
            onClick={() => setDeleteConfirmation({ 
              show: true, 
              taskId: task._id 
            })}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    ));
  };

  // Separate tasks into today's and upcoming using Singapore timezone
  const todaysTasks = studyTasks.filter(task => isToday(task.startTime));
  const scheduledTasks = studyTasks.filter(task => !isToday(task.startTime));

  return (
    <div className="study-screen">
      <header className="study-header">
        <div className="settings-header">
          <h1>Study Tasks</h1>
          <p className="settings-subtitle">Manage your Study Progress</p>
        </div>
      </header>

      <div className={`study-content ${isLeaving ? 'slide-out' : ''}`}>
        <div className="calendar-section">
          <div 
            className={`current-date-display ${showCalendar ? 'expanded' : ''}`}
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <div className="date-number">{currentDate.day}</div>
            <div className="date-details">
              <div className="weekday">{currentDate.weekday}</div>
              <div className="month-year">{currentDate.month} {currentDate.year}</div>
            </div>
          </div>

          {showCalendar && (
            <>
              <div className="calendar-header">
                <button onClick={handlePrevMonth} className="month-nav-btn">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <h2>
                  {currentMonth.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
                <button onClick={handleNextMonth} className="month-nav-btn">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
              
              <div className="weekday-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>

              <div className="calendar-grid">
                {generateCalendarDates().map(({ date, isCurrentMonth, hasTask }, index) => {
                  const dateTaskCount = studyTasks.filter(task => {
                    const taskDate = new Date(task.startTime);
                    return taskDate.toDateString() === date.toDateString();
                  }).length;

                  return (
                    <div 
                      key={index} 
                      className={`calendar-date ${
                        !isCurrentMonth ? 'other-month' : ''
                      } ${isToday(date) ? 'today' : ''} ${
                        selectedDateTasks?.date?.toDateString() === date.toDateString() 
                          ? 'selected' 
                          : ''
                      } ${hasTask ? 'has-task' : ''}`}
                      onClick={() => handleDateClick(date)}
                      data-task-count={dateTaskCount > 0 ? `${dateTaskCount} task${dateTaskCount > 1 ? 's' : ''}` : ''}
                    >
                      <span className="date-number">{date.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <section className="tasks-section">
          <div className="section-header">
            <h2>Study Tasks</h2>
            <button 
              className="add-task-icon"
              onClick={() => setShowAddTaskModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          {/* Today's Tasks */}
          <div className="task-group">
            <h3>Today's Tasks</h3>
            <div className="task-list">
              {currentTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={{
                    id: task._id,
                    title: task.notes || 'Untitled Task',
                    subject: task.subject,
                    duration: task.duration,
                    date: task.startTime,
                    progress: task.progress || 0,
                    status: task.status,
                    isActive: activeTask?.id === task._id
                  }}
                  onDelete={() => handleDeleteTask(task._id)}
                  onStart={() => handleStartTask(task._id)}
                  onComplete={handleTaskComplete}
                  subjects={subjects}
                  showDate={showDate}
                />
              ))}
              {currentTasks.length === 0 && (
                <p className="no-tasks">No tasks scheduled for today</p>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="task-group">
            <h3>Upcoming Tasks</h3>
            <div className="task-list">
              {originalUpcomingTasks.map((task) => (
                <TaskCard 
                  key={task._id} 
                  task={{
                    id: task._id,
                    title: task.notes || 'Untitled Task',
                    subject: task.subject,
                    duration: task.duration,
                    date: new Date(task.startTime),
                    progress: task.progress || 0,
                    status: task.status
                  }} 
                  onDelete={handleDeleteTask} 
                  onStart={() => handleStartTask(task._id)}
                  onComplete={handleTaskComplete}
                  subjects={subjects}
                  showDate={true}
                />
              ))}
              {originalUpcomingTasks.length === 0 && (
                <p className="no-tasks">No upcoming tasks scheduled</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {showAddTaskModal && (
        <AddTask 
          showAddTaskModal={showAddTaskModal} 
          setShowAddTaskModal={setShowAddTaskModal}
          onTaskAdded={refreshTasks} // Pass the refresh function
        />
      )}

      {showDateConfirm && (
        <div className="date-confirm-overlay">
          <div className="date-confirm-modal">
            <h3>Add task for {selectedDate?.toLocaleDateString()}?</h3>
            <div className="confirm-buttons">
              <button onClick={handleDateConfirm}>Yes</button>
              <button onClick={() => setShowDateConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {selectedDateTasks && (
        <div className="task-info-modal">
          <div className="task-info-content">
            <h3>{selectedDateTasks.date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</h3>
            <div className="task-info-list">
              {selectedDateTasks.tasks.map(task => (
                <div key={task.id} className="task-info-item">
                  <h4>{task.title}</h4>
                  <p className="task-info-subject">{task.subject}</p>
                  <p className="task-info-duration">Duration: {task.duration} minutes</p>
                  <div className="task-info-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                    <span>{task.progress}% Complete</span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="close-info-modal"
              onClick={() => setSelectedDateTasks(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {deleteConfirmation.show && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Delete Task</h3>
            <p>Are you sure you want to delete this task?</p>
            <div className="confirm-buttons">
              <button 
                onClick={() => {
                  handleDeleteTask(deleteConfirmation.taskId);
                  setDeleteConfirmation({ show: false, taskId: null });
                }}
              >
                Delete
              </button>
              <button 
                onClick={() => setDeleteConfirmation({ show: false, taskId: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="modal-overlay">
          <div className="edit-task-modal">
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button className="close-modal" onClick={() => setEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTask(editingTask._id, {
                notes: e.target.taskLabel.value,
                duration: parseInt(e.target.duration.value),
                subject: selectedSubject || editingTask.subject,
                startTime: new Date(e.target.date.value).toISOString()
              });
            }}>
              <div className="form-group">
                <label>Task Label</label>
                <input
                  type="text"
                  name="taskLabel"
                  defaultValue={editingTask?.title || ''}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  defaultValue={editingTask?.duration || 30}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <div className="subject-select-container">
                  <div 
                    className="subject-select"
                    onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                  >
                    <span>{selectedSubject || editingTask?.subject || 'Select Subject'}</span>
                    <FontAwesomeIcon icon={faChevronDown} />
                  </div>
                  {showSubjectDropdown && (
                    <div className="subject-dropdown">
                      {subjects.map((subject) => (
                        <div
                          key={subject._id}
                          className="subject-option"
                          onClick={() => {
                            setSelectedSubject(subject.name);
                            setShowSubjectDropdown(false);
                          }}
                        >
                          {subject.icon && (
                            <span className="subject-icon">
                              <FontAwesomeIcon icon={getIconByName(subject.icon)} />
                            </span>
                          )}
                          <span>{subject.name}</span>
                        </div>
                      ))}
                      <div 
                        className="subject-option custom-subject"
                        onClick={() => {
                          setShowAddSubjectModal(true);
                          setShowSubjectDropdown(false);
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Add Custom Subject</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="datetime-local"
                  name="date"
                  defaultValue={editingTask ? new Date(editingTask.date).toISOString().slice(0, 16) : ''}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="cancel-button" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav onNavigate={handleNavigation} />
    </div>
  );
};

export default StudyScreen;
