import React from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
import { MAINTENANCE_CONFIG } from '../config/maintenance';
import './maintenance-notfound.css';

export default function MaintenancePage({ connectButton, theme, onToggleTheme }) {
  const config = MAINTENANCE_CONFIG.MAINTENANCE_MESSAGE;

  return (
    <DefaultLayout
      title="Maintenance Mode"
      left={
        <div className="token-card maintenance-page">
          <div className="card-header">
            <div className="card-header-title">
              <div className="maintenance-icon-animated">🔧</div>
              {config.title}
            </div>
          </div>
          
          <div className="maintenance-content">
            <div className="maintenance-message">
              <p className="maintenance-subtitle">{config.subtitle}</p>
              <p className="maintenance-description">{config.description}</p>
            </div>
            
            <div className="maintenance-status">
              <div className="status-indicator">
                <div className="pulse-dot"></div>
                <span>System Status: Under Maintenance</span>
              </div>
            </div>
            
            <div className="maintenance-estimate">
              <div className="estimate-icon">⏱️</div>
              <div>
                <strong>Estimated completion:</strong>
                <br />
                {config.estimatedTime}
              </div>
            </div>
            
            {config.contactInfo && (
              <div className="maintenance-contact">
                <div className="contact-icon">📧</div>
                <p>{config.contactInfo}</p>
              </div>
            )}
            
            <div className="maintenance-animation">
              {/* Main Gears */}
              <div className="gear gear-1">⚙️</div>
              <div className="gear gear-2">⚙️</div>
              <div className="gear gear-3">⚙️</div>
              
              {/* Additional Decorative Gears */}
              <div className="gear gear-4">⚙️</div>
              <div className="gear gear-5">⚙️</div>
              
              {/* Sparks Effect */}
              <div className="gear-spark spark-1"></div>
              <div className="gear-spark spark-2"></div>
              <div className="gear-spark spark-3"></div>
              
              {/* Connection Lines */}
              <div className="gear-connection connection-1"></div>
              <div className="gear-connection connection-2"></div>
            </div>
          </div>
        </div>
      }
      right={null}
      connectButton={connectButton}
      theme={theme}
      onToggleTheme={onToggleTheme}
    />
  );
}