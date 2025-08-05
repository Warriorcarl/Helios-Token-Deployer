import React from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../components/layouts/DefaultLayout';
import './maintenance-notfound.css';

export default function NotFoundPage({ connectButton, theme, onToggleTheme }) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <DefaultLayout
      title="Page Not Found"
      left={
        <div className="token-card not-found-page">
          <div className="card-header">
            <div className="card-header-title">
              <div className="not-found-icon-animated">🔍</div>
              404 - Page Not Found
            </div>
          </div>
          
          <div className="not-found-content">
            <div className="not-found-message">
              <p className="not-found-subtitle">Oops! The page you're looking for doesn't exist.</p>
              <p className="not-found-description">It might have been moved, deleted, or you entered the wrong URL.</p>
            </div>
            
            <div className="not-found-status">
              <div className="status-indicator error">
                <div className="error-dot"></div>
                <span>Page Status: Not Found</span>
              </div>
            </div>
            
            <div className="not-found-actions">
              <button
                className="deploy-actions"
                onClick={handleGoHome}
                style={{
                  background: "var(--primary-blue)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--input-radius)",
                  padding: "0.9rem 1rem",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  width: "100%",
                  maxWidth: "300px",
                  margin: "0 auto"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#1445d1";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "var(--primary-blue)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🏠 Go Back Home
              </button>
            </div>
            
            <div className="not-found-help">
              <div className="help-icon">💡</div>
              <p>If you believe this is an error, please contact support.</p>
            </div>
            
            <div className="not-found-animation">
              <div className="floating-element element-1">📄</div>
              <div className="floating-element element-2">❓</div>
              <div className="floating-element element-3">🔗</div>
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