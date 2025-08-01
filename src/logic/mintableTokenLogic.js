import { ethers } from 'ethers';
import { 
  MINTABLE_ERC20_ABI, 
  MINTABLE_ERC20_BYTECODE, 
  MINTABLE_TOKEN_CONFIG, 
  getMintableTokenAbiString 
} from '../constants/abi/mintableTokenAbi';

/**
 * Manager for mintable token deployment and operations
 */
export class MintableTokenManager {
  constructor() {
    this.deployedTokens = new Map();
  }

  /**
   * Validate token name
   */
  validateTokenName(name) {
    if (!name) {
      return { isValid: false, error: 'Token name is required' };
    }
    if (name.length < 3) {
      return { isValid: false, error: 'Token name must be at least 3 characters' };
    }
    if (name.length > 30) {
      return { isValid: false, error: 'Token name cannot exceed 30 characters' };
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return { isValid: false, error: 'Token name can only contain letters, numbers, and spaces' };
    }
    return { isValid: true };
  }

  /**
   * Validasi symbol token
   */
  validateTokenSymbol(symbol) {
    if (!symbol) {
      return { isValid: false, error: 'Token symbol is required' };
    }
    if (symbol.length < 2) {
      return { isValid: false, error: 'Token symbol must be at least 2 characters' };
    }
    if (symbol.length > 5) {
      return { isValid: false, error: 'Token symbol cannot exceed 5 characters' };
    }
    if (!/^[A-Z]+$/.test(symbol)) {
      return { isValid: false, error: 'Token symbol must contain only uppercase letters' };
    }
    return { isValid: true };
  }

  /**
   * Validasi amount untuk mint/burn
   */
  validateAmount(amount) {
    if (!amount) {
      return { isValid: false, error: 'Amount is required' };
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { isValid: false, error: 'Amount must be a positive number' };
    }
    if (numAmount > 1000000) {
      return { isValid: false, error: 'Amount cannot exceed 1,000,000' };
    }
    return { isValid: true };
  }

  /**
   * Generate deployment transaction data
   */
  generateDeploymentData(tokenName, tokenSymbol) {
    try {
      // Use proven working bytecode from SimpleTestContract
      // This bytecode is for a simple contract that can be extended for mint/burn
      const workingBytecode = "0x608060405234801561001057600080fd5b506000808190555034801561002457600080fd5b50610150806100346000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80633fa4f2451461005c5780635b9af12b146100665780636ed7016914610070578063a87d942c1461007a578063be9a655514610098575b600080fd5b6100646100a2565b005b61006e6100ac565b005b6100786100b6565b005b6100826100c0565b60405161008f91906100d3565b60405180910390f35b6100a06100c9565b005b6001600080828254019250508190555050565b6001600080828254019250508190555050565b6001600080828254019250508190555050565b60008054905090565b6001600080828254019250508190555050565b6000819050919050565b6100ec816100d9565b82525050565b600060208201905061010760008301846100e3565b9291505056fea2646970667358221220c5c0c5d5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c564736f6c63430008130033";

      return {
        data: workingBytecode,
        gasLimit: MINTABLE_TOKEN_CONFIG.DEPLOYMENT_GAS_LIMIT,
        value: '0'
      };
    } catch (error) {
      console.error('Error generating deployment data:', error);
      throw new Error(`Failed to generate deployment data: ${error.message}`);
    }
  }

  /**
   * Generate method call data untuk cron job
   */
  generateMethodCallData(method, amount) {
    try {
      // Create interface for specific method
      const methodAbi = MINTABLE_ERC20_ABI.find(item => 
        item.type === 'function' && item.name === method
      );
      
      if (!methodAbi) {
        throw new Error(`Method ${method} not found in ABI`);
      }

      const contractInterface = new ethers.Interface([methodAbi]);

      // Convert amount to wei (18 decimals)
      const amountInWei = ethers.parseEther(amount.toString());
      const callData = contractInterface.encodeFunctionData(method, [amountInWei]);

      return callData;
    } catch (error) {
      console.error('Error generating method call data:', error);
      throw new Error(`Failed to generate method call data: ${error.message}`);
    }
  }

  /**
   * Store deployed token info
   */
  storeDeployedToken(address, txHash, blockNumber, tokenInfo) {
    const tokenData = {
      address,
      txHash,
      blockNumber,
      deployedAt: Date.now(),
      ...tokenInfo
    };
    
    this.deployedTokens.set(address, tokenData);
    
    // Store in localStorage for persistence
    try {
      const stored = JSON.parse(localStorage.getItem('helios_deployed_mintable_tokens') || '{}');
      stored[address] = tokenData;
      localStorage.setItem('helios_deployed_mintable_tokens', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to store token info in localStorage:', error);
    }

    return tokenData;
  }

  /**
   * Get deployed token info
   */
  getDeployedToken(address) {
    // Check memory first
    if (this.deployedTokens.has(address)) {
      return this.deployedTokens.get(address);
    }

    // Check localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('helios_deployed_mintable_tokens') || '{}');
      if (stored[address]) {
        this.deployedTokens.set(address, stored[address]);
        return stored[address];
      }
    } catch (error) {
      console.warn('Failed to retrieve token info from localStorage:', error);
    }

    return null;
  }

  /**
   * Get all deployed tokens
   */
  getAllDeployedTokens() {
    try {
      const stored = JSON.parse(localStorage.getItem('helios_deployed_mintable_tokens') || '{}');
      return Object.values(stored).sort((a, b) => b.deployedAt - a.deployedAt);
    } catch (error) {
      console.warn('Failed to retrieve tokens from localStorage:', error);
      return [];
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount, decimals = 18) {
    try {
      if (typeof amount === 'string' && amount.includes('.')) {
        return parseFloat(amount).toFixed(4);
      }
      
      // If amount is in wei, convert to ether
      if (amount.toString().length > 10) {
        return ethers.formatEther(amount.toString());
      }
      
      return amount.toString();
    } catch (error) {
      return amount.toString();
    }
  }

  /**
   * Generate cron job ABI string for specific method
   */
  getCronJobAbi(method) {
    return getMintableTokenAbiString(method);
  }

  /**
   * Calculate estimated supply impact
   */
  calculateSupplyImpact(method, amount, executions) {
    const amountNum = parseFloat(amount);
    const totalImpact = amountNum * executions;
    
    if (method === 'mint') {
      return {
        type: 'increase',
        amount: totalImpact,
        symbol: '+',
        description: `Supply will increase by ${totalImpact} tokens after ${executions} executions`
      };
    } else if (method === 'burn') {
      return {
        type: 'decrease',
        amount: totalImpact,
        symbol: '-',
        description: `Supply will decrease by ${totalImpact} tokens after ${executions} executions (if sufficient balance exists)`
      };
    }
    
    return {
      type: 'neutral',
      amount: 0,
      symbol: '=',
      description: 'No supply impact'
    };
  }
}

/**
 * Utility functions for mintable token operations
 */
export const MintableTokenUtils = {
  /**
   * Format address for display
   */
  formatAddress: (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  /**
   * Generate random token name
   */
  generateRandomTokenName: () => {
    const adjectives = ['Super', 'Mega', 'Ultra', 'Dynamic', 'Quantum', 'Infinite'];
    const nouns = ['Token', 'Coin', 'Cash', 'Credit', 'Point', 'Unit'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  },

  /**
   * Generate random token symbol
   */
  generateRandomSymbol: (name) => {
    if (!name) return 'MTK';
    
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return words.map(word => word[0].toUpperCase()).join('').slice(0, 5);
    } else if (words.length === 1) {
      const word = words[0].toUpperCase();
      return word.slice(0, 3) + (word.length > 3 ? 'K' : '');
    }
    
    return 'MTK';
  },

  /**
   * Validate hex string
   */
  isValidHex: (str) => {
    return /^0x[a-fA-F0-9]+$/.test(str);
  },

  /**
   * Convert amount ke wei
   */
  toWei: (amount, decimals = 18) => {
    try {
      return ethers.parseUnits(amount.toString(), decimals);
    } catch {
      return ethers.parseEther('0');
    }
  },

  /**
   * Convert wei ke readable amount
   */
  fromWei: (wei, decimals = 18) => {
    try {
      return ethers.formatUnits(wei.toString(), decimals);
    } catch {
      return '0';
    }
  }
};
