import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackToHomeButton.css';

const BackToHomeButton = ({ 
  className = '', 
  style = {},
  variant = 'default' // 'default', 'compact', 'floating'
}) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <button 
      className={`back-to-home-btn ${variant} ${className}`}
      onClick={handleBackToHome}
      style={style}
      aria-label="Back to Home"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="home-icon"
      >
        <path 
          d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className="home-text">Back to Home</span>
    </button>
  );
};

export default BackToHomeButton;