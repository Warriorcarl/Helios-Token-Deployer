// Simple Test Contract ABI - Direct import from compiled artifacts
import SimpleTestContractArtifact from './SimpleTestContract.json';

// Extract ABI and bytecode directly from the compiled artifact
export const SIMPLE_TEST_CONTRACT_ABI = SimpleTestContractArtifact.abi;
export const SIMPLE_TEST_CONTRACT_BYTECODE = SimpleTestContractArtifact.bytecode;

// Contract configuration - Gas Optimized
export const SIMPLE_TEST_CONTRACT_CONFIG = {
  DEPLOYMENT_GAS_LIMIT: 300000,  // Reduced from 500k for simple contract
  GAS_LIMIT: 50000,              // Reduced from 100k for simple operations
  contractName: SimpleTestContractArtifact.contractName,
  description: "Simple contract for cron job testing",
  version: "1.0.0"
};

// Available methods for cron targeting - dynamically extracted from ABI
export const SIMPLE_CONTRACT_METHODS = SIMPLE_TEST_CONTRACT_ABI
  .filter(item => item.type === 'function' && item.stateMutability === 'nonpayable')
  .filter(func => ['increment', 'ping', 'trigger'].includes(func.name))
  .map(func => ({
    value: func.name,
    label: `${func.name}() - ${func.name.charAt(0).toUpperCase() + func.name.slice(1)} function`
  }));

// Helper function to get method ABI as JSON string
export function getSimpleContractAbiString(methodName = 'increment') {
  const methodAbi = SIMPLE_TEST_CONTRACT_ABI.find(item => 
    item.type === 'function' && item.name === methodName
  );
  
  return methodAbi ? JSON.stringify([methodAbi]) : JSON.stringify([SIMPLE_TEST_CONTRACT_ABI.find(item => item.name === 'increment')]);
}