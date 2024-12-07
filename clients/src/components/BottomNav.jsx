import { faCog, faHome, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const [rippleMap, setRippleMap] = useState({});

  const isActive = (path) => {
    return location.pathname === path;
  };

  const createRipple = (event, path) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - radius}px`;
    ripple.style.top = `${event.clientY - rect.top - radius}px`;
    ripple.className = 'nav-icon-ripple';

    const oldRipple = button.getElementsByClassName('nav-icon-ripple')[0];
    if (oldRipple) {
      oldRipple.remove();
    }

    button.appendChild(ripple);

    const icon = button.querySelector('.fa-icon');
    if (icon) {
      icon.style.transform = 'scale(0.9)';
      setTimeout(() => {
        icon.style.transform = '';
      }, 150);
    }

    setTimeout(() => {
      ripple.remove();
    }, 800);

    setRippleMap(prev => ({
      ...prev,
      [path]: Date.now()
    }));
  };

  return (
    <nav className="bottom-nav">
      <Link
        to="/home"
        className={`nav-icon ${isActive('/home') ? 'active' : ''}`}
        onClick={(e) => createRipple(e, '/home')}
      >
        <FontAwesomeIcon icon={faHome} className="fa-icon" />
      </Link>

      <Link
        to="/study"
        className="nav-icon add-button"
        onClick={(e) => createRipple(e, '/study')}
      >
        <div className="add-icon-circle">
          <FontAwesomeIcon icon={faPlus} className="fa-icon" />
        </div>
      </Link>

      <Link
        to="/settings"
        className={`nav-icon ${isActive('/settings') ? 'active' : ''}`}
        onClick={(e) => createRipple(e, '/settings')}
      >
        <FontAwesomeIcon icon={faCog} className="fa-icon" />
      </Link>
    </nav>
  );
};

export default BottomNav;
