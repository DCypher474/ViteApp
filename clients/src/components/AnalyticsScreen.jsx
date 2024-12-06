import React from 'react';
import './AnalyticsScreen.css';
import BottomNav from './BottomNav';

const AnalyticsScreen = () => {
  return (
    <div className="analytics-screen">
      <div className="analytics-main">
        <header className="analytics-header">
          <h1>Progress Analytics</h1>
          <p className="settings-subtitle">Track your learning journey</p>
        </header>

        <main className="analytics-content">
          <div className="stats-overview">
            <div className="stat-card">
              <h3>Study Time</h3>
              <div className="stat-value">--</div>
              <p>This Week</p>
            </div>
            <div className="stat-card">
              <h3>Tasks Completed</h3>
              <div className="stat-value">--</div>
              <p>This Week</p>
            </div>
          </div>

          <div className="progress-charts">
            <div className="chart-container">
              <h3>Weekly Progress</h3>
              <div className="placeholder-chart">
                <p>Weekly progress visualization will be displayed here</p>
              </div>
            </div>

            <div className="chart-container">
              <h3>Subject Distribution</h3>
              <div className="placeholder-chart">
                <p>Subject distribution visualization will be displayed here</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default AnalyticsScreen; 