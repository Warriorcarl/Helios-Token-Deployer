import React from 'react';
import BackToHomeButton from '../ui/BackToHomeButton.jsx';
import ThemeToggleButton from '../ui/ThemeToggleButton.jsx';

const HeliosLogo = () => (
  <img src="/helios-logo.svg" className="helios-logo-img" alt="Helios Logo" />
);

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 700);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

export default function DefaultLayout({ title, left, right, connectButton, theme, onToggleTheme, showBackButton = true }) {
  const isMobile = useIsMobile();

  return (
    <div className="app-main">
      {isMobile ? (
        <>
          <div className="mobile-header">
            <div className="mobile-header-actions">
              <div className="mobile-connect-center">
                {connectButton}
              </div>
            </div>
            <div className="mobile-header-titlelogo">
              <HeliosLogo />
              <span className="right-panel-title">{title}</span>
              <div className="mobile-title-actions">
                {showBackButton && (
                  <BackToHomeButton variant="compact" />
                )}
              </div>
            </div>
          </div>
          <div>{left}</div>
          <div>{right}</div>
        </>
      ) : (
        <>
          <div className="left-panel">{left}</div>
          <div className="right-panel">
            <div className="right-panel-header">
              <HeliosLogo />
              <span className="right-panel-title">{title}</span>
              <div className="connect-wallet-override">
                {showBackButton && <BackToHomeButton variant="compact" />}
                {connectButton}
              </div>
            </div>
            {right}
          </div>
        </>
      )}
    </div>
  );
}