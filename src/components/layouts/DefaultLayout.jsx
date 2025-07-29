import React, { useState } from 'react';

const HeliosLogo = () => (
  <img src="/helios-logo.svg" className="helios-logo-img" alt="Helios Logo" />
);
const MenuIcon = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="24" fill="#D7E0FF"/>
    <path d="M30.6667 15.6666H17.3333C16.4128 15.6666 15.6667 16.4128 15.6667 17.3333V20.6666C15.6667 21.5871 16.4128 22.3333 17.3333 22.3333H30.6667C31.5871 22.3333 32.3333 21.5871 32.3333 20.6666V17.3333C32.3333 16.4128 31.5871 15.6666 30.6667 15.6666Z" stroke="#002DCB" strokeWidth="1.06" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30.6667 25.6666H17.3333C16.4128 25.6666 15.6667 26.4128 15.6667 27.3333V30.6666C15.6667 31.5871 16.4128 32.3333 17.3333 32.3333H30.6667C31.5871 32.3333 32.3333 31.5871 32.3333 30.6666V27.3333C32.3333 26.4128 31.5871 25.6666 30.6667 25.6666Z" stroke="#002DCB" strokeWidth="1.06" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 19H19.0083" stroke="#002DCB" strokeWidth="1.06" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 29H19.0083" stroke="#002DCB" strokeWidth="1.06" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ToggleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="16" fill="#D7E0FF"/>
    <path d="M16 22V23.3334M20.24 20.24L21.1867 21.1867M10.8133 21.1867L11.76 20.24M8.66667 16H10M22 16H23.3333M20.24 11.76L21.1867 10.8134M10.8133 10.8134L11.76 11.76M16 8.66669V10M19.3333 16C19.3333 17.841 17.841 19.3334 16 19.3334C14.1591 19.3334 12.6667 17.841 12.6667 16C12.6667 14.1591 14.1591 12.6667 16 12.6667C17.841 12.6667 19.3333 14.1591 19.3333 16Z" stroke="#002DCB" strokeWidth="1.06" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const menuItems = [
  { name: "Token", route: "/token", active: true },
  { name: "Cron Job", route: "/cronjob", dev: true },
  { name: "Deploy NFT", route: "/deploy-nft", dev: true },
  { name: "Swap", route: "/swap", dev: true },
  { name: "Stake", route: "/stake", dev: true },
  { name: "Game", route: "/game", dev: true },
  { name: "Other", route: "/other", dev: true },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 700);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

export default function DefaultLayout({ title, left, right, connectButton, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const ThemeSwitcherBtn = (
    <button className="theme-switcher" onClick={onToggleTheme} aria-label="Toggle Theme">
      <ToggleIcon />
    </button>
  );

  return (
    <div className="app-main">
      {isMobile ? (
        <>
          <div className="mobile-header">
            <div className="mobile-header-actions">
              <button className="menu-icon-btn" aria-label="Menu" onClick={() => setMenuOpen(m => !m)}>
                <MenuIcon />
              </button>
              <div className="mobile-connect-center">
                {connectButton}
              </div>
              {ThemeSwitcherBtn}
              {menuOpen && (
                <div className="menu-dropdown">
                  {menuItems.map((item) => (
                    <a key={item.name} href={item.route} className={'menu-dropdown-item' + (item.active ? ' active' : '')}>
                      {item.name}
                      {item.dev && <span className="menu-dropdown-dev">(under development)</span>}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="mobile-header-titlelogo">
              <HeliosLogo />
              <span className="right-panel-title">{title}</span>
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
                {connectButton}
                {ThemeSwitcherBtn}
                <button className="menu-icon-btn" aria-label="Menu" onClick={() => setMenuOpen(m => !m)}>
                  <MenuIcon />
                </button>
                {menuOpen && (
                  <div className="menu-dropdown">
                    {menuItems.map((item) => (
                      <a key={item.name} href={item.route} className={'menu-dropdown-item' + (item.active ? ' active' : '')}>
                        {item.name}
                        {item.dev && <span className="menu-dropdown-dev">(under development)</span>}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {right}
          </div>
        </>
      )}
    </div>
  );
}