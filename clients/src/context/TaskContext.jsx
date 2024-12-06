import React, { createContext, useContext, useEffect, useState } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (activeTask) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTask]);

  const startTask = (task) => {
    setActiveTask(task);
    setTimer(0);
  };

  const stopTask = () => {
    const completedTime = Math.floor(timer / 60);
    const taskData = { ...activeTask, completedTime };
    setActiveTask(null);
    setTimer(0);
    return taskData;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <TaskContext.Provider value={{
      activeTask,
      timer,
      formatTime,
      startTask,
      stopTask
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => useContext(TaskContext);