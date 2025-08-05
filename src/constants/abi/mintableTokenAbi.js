// Mintable ERC20 Token ABI - Direct import from compiled artifacts
import MintableTokenArtifact from './MintableERC20Token.json';

// Extract ABI and bytecode directly from the compiled artifact
export const MINTABLE_ERC20_ABI = MintableTokenArtifact.abi;
export const MINTABLE_ERC20_BYTECODE = MintableTokenArtifact.bytecode;

// Configuration for Mintable Token - Gas Optimized
export const MINTABLE_TOKEN_CONFIG = {
  DEPLOYMENT_GAS_LIMIT: 1500000,  // Increased from 500,000 for complex contract
  MINT_GAS_LIMIT: 150000,         // Increased from 50,000 for complex ERC20 operations
  BURN_GAS_LIMIT: 120000,         // Increased from 45,000 for complex ERC20 operations
  DEFAULT_MINT_AMOUNT: "1000000000000000000", // 1 token in wei
  DEFAULT_DECIMALS: 18,
  contractName: MintableTokenArtifact.contractName,
  description: "ERC20 token with public mint and burn functions",
  version: "1.0.0"
};

// Available methods for cron jobs - dynamically extracted from ABI
export const MINTABLE_TOKEN_METHODS = MintableTokenArtifact.abi
  .filter(item => item.type === 'function' && item.stateMutability === 'nonpayable')
  .filter(func => ['mint', 'burn', 'mintAndBurn'].includes(func.name))
  .map(func => ({
    value: func.name,
    label: `${func.name}(amount) - ${func.name === 'mintAndBurn' ? 'Mint 2x amount then burn 1x amount (ratio 2:1)' : func.name.charAt(0).toUpperCase() + func.name.slice(1) + ' tokens'}`,
    requiresAmount: true
  }));

// Helper function to get ABI method as JSON string
export function getMintableTokenAbiString(methodName = 'mint') {
  const methodAbi = MINTABLE_ERC20_ABI.find(item => 
    item.type === 'function' && item.name === methodName
  );
  
  return methodAbi ? JSON.stringify([methodAbi]) : JSON.stringify([MINTABLE_ERC20_ABI.find(item => item.name === 'mint')]);
}
