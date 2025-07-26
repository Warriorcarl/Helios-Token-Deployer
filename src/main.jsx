import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Define Helios Testnet Chain
const heliosTestnet = {
  id: 42000,
  name: 'Helios Chain Testnet',
  nativeCurrency: {
    name: 'Helios',
    symbol: 'HLS',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet1.helioschainlabs.org'] },
  },
  blockExplorers: {
    default: { name: 'Helios Explorer', url: 'https://explorer.helioschainlabs.org' },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: 'Helios Token Deployer',
  projectId: '4d50c7253cc77e946ec2ef8569b79ce6', // Get yours from https://cloud.walletconnect.com
  chains: [heliosTestnet],
  ssr: false, // set to false for client-side rendering
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);