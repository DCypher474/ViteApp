import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AnalyticsScreen from "./components/AnalyticsScreen";
import GoalsScreen from "./components/GoalsScreen";
import HomeScreen from "./components/HomeScreen";
import LoginScreen from "./components/LoginScreen";
import ProfileScreen from "./components/ProfileScreen";
import RemindersScreen from "./components/RemindersScreen";
import SettingScreen from "./components/SettingScreen";
import SignupScreen from "./components/SignupScreen";
import StartupScreen from "./components/StartupScreen";
import StudyScreen from "./components/StudyScreen";
import { TaskProvider } from './context/TaskContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <TaskProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StartupScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/login" element={<LoginScreen />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <StudyScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <RemindersScreen />
            </ProtectedRoute>
          }
        />

        {/* Catch all route - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TaskProvider>
  );
};

export default App;
