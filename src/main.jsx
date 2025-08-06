import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import TokenDeployerPage from './pages/TokenDeployerPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import ChronosJobPage from './pages/ChronosJobPage.jsx';
import MaintenancePage from './pages/MaintenancePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import MaintenanceGuard from './components/MaintenanceGuard.jsx';
import './style.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Import separated network configuration using index file
import { NETWORK_CONFIG } from './logic';

const config = getDefaultConfig({
  appName: 'Helios Task Helper',
  projectId: '4d50c7253cc77e946ec2ef8569b79ce6',
  chains: [NETWORK_CONFIG.HELIOS_TESTNET],
  ssr: false,
});

const queryClient = new QueryClient();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };
  return children({ theme, handleToggleTheme });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider>
            {({ theme, handleToggleTheme }) => (
              <BrowserRouter>
                <MaintenanceGuard>
                  <Routes>
                    <Route path="/" element={<LandingPage connectButton={<ConnectButton />} theme={theme} onToggleTheme={handleToggleTheme} />} />
                    <Route path="/token" element={<TokenDeployerPage />} />
                    <Route path="/chronos" element={<ChronosJobPage connectButton={<ConnectButton />} theme={theme} onToggleTheme={handleToggleTheme} />} />
                    <Route path="/deploy-nft" element={<PlaceholderPage title="Deploy NFT" connectButton={<ConnectButton />} theme={theme} onToggleTheme={handleToggleTheme} />} />
                    <Route path="/swap" element={<PlaceholderPage title="Swap" connectButton={<ConnectButton />} theme={theme} onToggleTheme={handleToggleTheme} />} />
                    <Route path="/stake" element={<PlaceholderPage title="Stake" connectButton={<ConnectButton />} theme={theme} onToggleTheme={handleToggleTheme} />} />
                    <Route path="/game" element={<PlaceholderPage title="Game" connectButton={<ConnectButton />} theme={theme} onToggleTheme={handleToggleTheme} />} />
                    <Route path="/other" element={<PlaceholderPage title="Other" connectButton={<ConnectButton />} theme={theme} onToggleTheme={handleToggleTheme} />} />
                    <Route path="/maintenance" element={<MaintenancePage connectButton={<ConnectButton />} theme={theme} onToggleTheme={handleToggleTheme} />} />
                    <Route path="*" element={<NotFoundPage connectButton={<ConnectButton />} theme={theme} onToggleTheme={handleToggleTheme} />} />
                  </Routes>
                </MaintenanceGuard>
              </BrowserRouter>
            )}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);