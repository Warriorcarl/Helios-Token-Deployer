import React from 'react';
import './ThemeToggleButton.css';

const ThemeToggleButton = ({ theme, onToggle, variant = 'simple' }) => (
  <button 
    className={`theme-toggle-${variant}`} 
    onClick={onToggle} 
    aria-label="Toggle Theme"
  >
    {theme === 'dark' ? '☀️' : '🌙'}
  </button>
);

export default ThemeToggleButton;