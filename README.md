# Helios Chronos DApp

![DEMO](./DEMO.gif)

A comprehensive blockchain automation platform built on Helios Chain, featuring automated cron jobs, token deployment, and smart contract management with a modern, responsive interface.

---

## 🌟 Overview

Helios Chronos is a full-featured decentralized application that combines multiple blockchain utilities:

- **🤖 Automated Cron Jobs**: Create blockchain-based scheduled tasks that execute smart contract functions automatically
- **🪙 Production Token Deployment**: Deploy ERC20 tokens using Helios precompile contracts with full functionality
- **🔧 Cron Testing Tokens**: Deploy basic mintable tokens specifically for testing cron job automation
- **⚡ Smart Contract Automation**: Deploy and manage various smart contracts with automated execution
- **📊 Real-time Monitoring**: Track deployments, transactions, and cron job execution in real-time
- **🎨 Modern UI/UX**: Responsive design with dark/light theme support and mobile optimization

---

## 🚀 Key Features

### Production Token Deployment (Main Feature)
- **Precompile Integration**: Uses Helios precompile contract (`0x0000000000000000000000000000000000000806`)
- **Full ERC20 Functionality**: Complete token creation with custom parameters
- **Logo Support**: Dynamic SVG generation and image upload capabilities
- **Production Ready**: Proper denomination generation, validation, and gas optimization
- **Custom Parameters**: Token name, symbol, total supply, decimals, and logo
- **Explorer Integration**: Direct links to Helios blockchain explorer

### Cron Job Management
- **Automated Execution**: Schedule smart contract function calls to run at specific block intervals
- **Multi-Contract Support**: Create cron jobs for various contract types (Simple Test Contracts, Basic Mintable Tokens)
- **Real-time Monitoring**: Track active cron jobs with live status updates
- **Gas Optimization**: Built-in gas optimization for efficient transaction execution

### Cron Testing Token Deployment (Testing Only)
- **Basic Mintable Tokens**: Simple ERC20 tokens deployed via bytecode for cron testing
- **Mint/Burn Functions**: Public functions specifically designed for cron job automation
- **Zero Initial Supply**: Tokens start with 0 supply, controlled entirely by cron jobs
- **Testing Purpose**: Designed purely for demonstrating and testing cron functionality

### Smart Contract Automation
- **Simple Test Contracts**: Deploy basic contracts for testing and automation
- **Contract Interaction**: Automated function calls through cron job scheduling
- **Transaction Tracking**: Comprehensive logging and monitoring of all contract interactions

### User Experience
- **Responsive Design**: Optimized for desktop and mobile devices
- **Theme Support**: Dark/light mode with persistent user preferences
- **Real-time Console**: Live transaction and deployment logging
- **Wallet Integration**: Seamless connection with Rainbow Kit and Wagmi
- **Multi-Feature Navigation**: Dedicated pages for different functionalities

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Blockchain Integration**: 
  - Wagmi v2 (Ethereum interaction)
  - RainbowKit (Wallet connectivity)
  - Viem (TypeScript Ethereum library)
  - Ethers.js (Contract interaction)
- **Styling**: Custom CSS with CSS variables for theming
- **Routing**: React Router DOM
- **State Management**: React hooks with custom state management
- **Network**: Helios Testnet integration
- **Additional**: HTML2Canvas for image generation

---

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRON2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

---

## 🎯 Usage

### Production Token Deployment
1. **Navigate to Token Deployer**: Main page with full token creation features
2. **Configure Token**: Set name, symbol, total supply, and logo
3. **Deploy via Precompile**: Uses Helios precompile contract for production-ready tokens
4. **Monitor Deployment**: Real-time console showing deployment progress and results

### Cron Job Automation
1. **Navigate to Cron Jobs**: Select "Cron Job" from the dropdown menu
2. **Choose Contract Type**: 
   - Simple Test Contract (basic functions for testing)
   - Basic Mintable Token (for token automation testing)
3. **Deploy Test Contract**: Create contract specifically for cron automation
4. **Configure Cron**: Set frequency, expiration, and target function
5. **Monitor Execution**: Track cron jobs in "My Cron Jobs" section

### Key Differences

| Feature | Production Token Deployment | Cron Testing Token Deployment |
|---------|----------------------------|------------------------------|
| **Purpose** | Full-featured ERC20 tokens | Basic tokens for cron testing |
| **Method** | Precompile contract | Direct bytecode deployment |
| **Initial Supply** | Customizable | 0 (controlled by cron) |
| **Features** | Complete ERC20 + Logo | Basic mint/burn only |
| **Use Case** | Production tokens | Cron job demonstration |

---

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── cron/            # Cron job specific components
│   ├── layouts/         # Page layouts and navigation
│   └── ui/              # Generic UI components
├── constants/           # Contract ABIs and addresses
├── hooks/               # Custom React hooks
├── logic/               # Business logic modules
├── pages/               # Page components
│   ├── TokenDeployerPage.jsx    # Production token deployment
│   └── ChronosJobPage.jsx       # Cron jobs + testing tokens
├── styles/              # Styling and themes
└── utils/               # Utility functions
```

---

## 🌐 Available Features

- **✅ Production Token Deployer**: Full ERC20 deployment via precompile
- **✅ Cron Job Manager**: Automated smart contract execution
- **✅ Basic Testing Tokens**: Simple tokens for cron automation testing
- **🚧 Deploy NFT**: NFT deployment and management (coming soon)
- **🚧 Swap**: Token swapping functionality (coming soon)
- **🚧 Stake**: Staking mechanisms (coming soon)
- **🚧 Game**: Blockchain gaming features (coming soon)

---

## 🔧 Configuration

The application is configured for Helios Testnet by default. Key configurations include:

- **Production Tokens**: Precompile contract `0x0000000000000000000000000000000000000806`
- **Network**: Helios Testnet
- **Wallet**: RainbowKit integration with multiple wallet support
- **Gas Optimization**: Built-in gas price optimization for both deployment types
- **Theme**: Persistent dark/light mode switching

---

## 📚 Documentation

Additional documentation is available in the `docs/` folder:

- **Gas Optimization**: Detailed gas optimization strategies
- **Cron Creation**: Step-by-step cron job creation guide  
- **Token Features**: Both production and testing token implementation details
- **Bug Fixes**: Documentation of resolved issues and improvements

---

## 🤝 Contributing

This project is built with AI assistance for educational purposes. Contributions, issues, and feature requests are welcome.

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🔗 Links

- **Helios Chain**: [https://hub.helioschain.network](https://hub.helioschain.network)
- **Explorer**: View transactions and contracts on Helios Explorer
- **Demo**: See DEMO.gif for a visual walkthrough

---

## ⚠️ Disclaimer

*This application is built with AI assistance for educational and demonstration purposes. The cron testing tokens are specifically designed for automation testing and should not be used for production purposes. Use the production token deployer for real token creation needs.*
