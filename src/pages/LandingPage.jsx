import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggleButton from '../components/ui/ThemeToggleButton';
import './landing-page.css';

const HeliosLogo = () => (
  <img src="/helios-logo.svg" className="helios-logo-img" alt="Helios Logo" />
);

const QuickActionCard = ({ icon, title, description, route, isActive, onClick, badge }) => (
  <div 
    className={`quick-action-card ${isActive ? 'active' : 'disabled'}`}
    onClick={onClick}
  >
    <div className="action-icon">{icon}</div>
    <div className="action-content">
      <h3 className="action-title">{title}</h3>
      <p className="action-description">{description}</p>
    </div>
    {badge && <span className="action-badge">{badge}</span>}
    {isActive && <div className="action-arrow">→</div>}
  </div>
);

export default function LandingPage({ connectButton, theme: themeProp, onToggleTheme }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(themeProp || 'dark');

  // Theme management
  useEffect(() => {
    if (themeProp) {
      setTheme(themeProp);
    } else {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, [themeProp]);

  const handleToggleTheme = onToggleTheme || (() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  const activeFeatures = [
    {
      icon: '🪙',
      title: 'Token Creator',
      description: 'Create and deploy ERC20 tokens easily',
      route: '/token',
      isActive: true
    },
    {
      icon: '⏰',
      title: 'Chronos',
      description: 'Automate your daily Helios testnet tasks',
      route: '/chronos',
      isActive: true
    }
  ];

  const comingSoonFeatures = [
    {
      icon: '🎨',
      title: 'NFT Tools',
      description: 'Coming Soon',
      route: '/deploy-nft',
      isActive: false,
      badge: 'Soon'
    },
    {
      icon: '🔄',
      title: 'Token Swap',
      description: 'Coming Soon',
      route: '/swap',
      isActive: false,
      badge: 'Soon'
    },
    {
      icon: '🥩',
      title: 'Staking Helper',
      description: 'Coming Soon',
      route: '/stake',
      isActive: false,
      badge: 'Soon'
    },
    {
      icon: '🎮',
      title: 'Gaming Tools',
      description: 'Coming Soon',
      route: '/game',
      isActive: false,
      badge: 'Soon'
    }
  ];

  const handleFeatureClick = (feature) => {
    if (feature.isActive) {
      navigate(feature.route);
    }
  };

  return (
    <div className="landing-simple">
      {/* Header */}
      <header className="header-simple">
        <div className="header-content-simple">
          <div className="header-brand">
            <HeliosLogo />
            <h1>Helios Task Helper</h1>
          </div>
          <div className="header-actions">
            {connectButton}
            <ThemeToggleButton theme={theme} onToggle={handleToggleTheme} variant="simple" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2 className="welcome-title">
            Simplify Your <span className="brand-highlight">Helios</span> Tasks
          </h2>
          <p className="welcome-subtitle">
            Your personal helper for Helios testnet daily tasks and blockchain operations
          </p>
        </section>

        {/* Active Tools */}
        <section className="tools-section">
          <h3 className="section-heading">🚀 Available Tools</h3>
          <div className="tools-grid active-tools">
            {activeFeatures.map((feature, index) => (
              <QuickActionCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                route={feature.route}
                isActive={feature.isActive}
                onClick={() => handleFeatureClick(feature)}
                badge={feature.badge}
              />
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section className="tools-section">
          <h3 className="section-heading">🔮 Coming Soon</h3>
          <div className="tools-grid coming-soon-tools">
            {comingSoonFeatures.map((feature, index) => (
              <QuickActionCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                route={feature.route}
                isActive={feature.isActive}
                onClick={() => handleFeatureClick(feature)}
                badge={feature.badge}
              />
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="links-section">
          <h3 className="section-heading">🔗 Helpful Links</h3>
          <div className="quick-links">
            <a 
              href="https://testnet.helioschain.network/?code=COSMOS-TITAN-230" 
              target="_blank" 
              rel="noopener noreferrer"
              className="quick-link"
            >
              📊 Testnet Explorer
            </a>
            <a 
              href="https://portal.helioschain.network" 
              target="_blank" 
              rel="noopener noreferrer"
              className="quick-link"
            >
              🌐 Helios Portal
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-simple">
        <p>Helios Task Helper • Independent tool for testnet users</p>
      </footer>
    </div>
  );
}