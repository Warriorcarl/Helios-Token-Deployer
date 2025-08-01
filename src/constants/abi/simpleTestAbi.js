// Simple Test Contract ABI for Cron Target
// Minimalist contract with random function names for testing

export const SIMPLE_TEST_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "getValue",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ping",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "trigger",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Simple bytecode for basic counter-like contract
export const SIMPLE_TEST_CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b506000808190555034801561002457600080fd5b50610150806100346000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80633fa4f2451461005c5780635b9af12b146100665780636ed7016914610070578063a87d942c1461007a578063be9a655514610098575b600080fd5b6100646100a2565b005b61006e6100ac565b005b6100786100b6565b005b6100826100c0565b60405161008f91906100d3565b60405180910390f35b6100a06100c9565b005b6001600080828254019250508190555050565b6001600080828254019250508190555050565b6001600080828254019250508190555050565b60008054905090565b6001600080828254019250508190555050565b6000819050919050565b6100ec816100d9565b82525050565b600060208201905061010760008301846100e3565b9291505056fea2646970667358221220c5c0c5d5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c564736f6c63430008130033";

// Contract configuration - Gas Optimized
export const SIMPLE_TEST_CONTRACT_CONFIG = {
  DEPLOYMENT_GAS_LIMIT: 300000,  // Reduced from 500k for simple contract
  GAS_LIMIT: 50000,              // Reduced from 100k for simple operations
  contractName: "SimpleTestContract",
  description: "Simple contract for cron job testing",
  version: "1.0.0"
};

// Available methods for cron targeting
export const SIMPLE_CONTRACT_METHODS = [
  { value: 'increment', label: 'increment() - Increment counter' },
  { value: 'ping', label: 'ping() - Ping function' },
  { value: 'trigger', label: 'trigger() - Trigger function' }
];

// Helper function to get method ABI as JSON string
export function getSimpleContractAbiString(methodName = 'increment') {
  const methodAbi = SIMPLE_TEST_CONTRACT_ABI.find(item => 
    item.type === 'function' && item.name === methodName
  );
  
  return methodAbi ? JSON.stringify([methodAbi]) : JSON.stringify([SIMPLE_TEST_CONTRACT_ABI[2]]);
}