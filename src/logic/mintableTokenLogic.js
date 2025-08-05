import { ethers } from 'ethers';
import { parseEther, parseUnits } from 'viem';
import { 
  MINTABLE_ERC20_ABI, 
  MINTABLE_ERC20_BYTECODE, 
  MINTABLE_TOKEN_CONFIG, 
  getMintableTokenAbiString 
} from '../constants/abi/mintableTokenAbi';
import { getOptimizedGasLimit, getOptimizedGasPrice } from '../utils/gasOptimization';

/**
 * Manager for mintable token deployment and operations
 */
export class MintableTokenManager {
  constructor() {
    this.deployedTokens = new Map();
    this.SUPPORTED_METHODS = ['mint', 'burn', 'mintAndBurn'];
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
   * Generate deployment transaction data with proper constructor encoding
   */
  generateDeploymentData(tokenName, tokenSymbol, selectedMethod = 'mint') {
    try {
      // Validate inputs
      const nameValidation = this.validateTokenName(tokenName);
      const symbolValidation = this.validateTokenSymbol(tokenSymbol);
      
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.error);
      }
      if (!symbolValidation.isValid) {
        throw new Error(symbolValidation.error);
      }

      // Use the correct MintableERC20 bytecode from JSON artifact
      const baseBytecode = MINTABLE_ERC20_BYTECODE;
      
      // Validate bytecode exists
      if (!baseBytecode || !baseBytecode.startsWith('0x')) {
        throw new Error('Invalid bytecode in MintableERC20Token artifact');
      }
      
      // Encode constructor parameters properly using ABI Coder
      const constructorAbi = MINTABLE_ERC20_ABI.find(item => item.type === 'constructor');
      if (!constructorAbi) {
        throw new Error('Constructor ABI not found in MintableERC20Token artifact');
      }

      // Use AbiCoder for more reliable encoding
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const constructorTypes = constructorAbi.inputs.map(input => input.type);
      const constructorValues = [tokenName, tokenSymbol];
      
      // Encode constructor parameters
      const encodedConstructorParams = abiCoder.encode(constructorTypes, constructorValues);
      
      // Combine bytecode with encoded constructor parameters
      const fullBytecode = baseBytecode + encodedConstructorParams.slice(2);

      console.log('✅ Deployment bytecode generated successfully');
      console.log(`📝 Token Name: ${tokenName}`);
      console.log(`📝 Token Symbol: ${tokenSymbol}`);
      console.log(`📝 Bytecode length: ${fullBytecode.length} characters`);

      return {
        data: fullBytecode,  // ✅ Proper bytecode with encoded constructor
        gasLimit: MINTABLE_TOKEN_CONFIG.DEPLOYMENT_GAS_LIMIT,
        value: '0',
        requiresInitialMint: selectedMethod === 'burn',
        // Additional verification data
        verificationData: {
          contractName: 'MintableERC20Token',
          constructorArgs: [tokenName, tokenSymbol],
          bytecode: baseBytecode,
          abi: MINTABLE_ERC20_ABI
        }
      };
    } catch (error) {
      console.error('Error generating deployment data:', error);
      throw new Error(`Failed to generate deployment data: ${error.message}`);
    }
  }

  /**
   * Prepare initial mint transaction if burn method is selected
   */
  prepareInitialMintForBurn(contractAddress, amount) {
    try {
      if (!contractAddress || !contractAddress.startsWith('0x')) {
        throw new Error('Invalid contract address for initial mint');
      }

      // Create mint call data
      const mintCallData = this.generateMethodCallData('mint', amount);
      
      return {
        to: contractAddress,
        data: mintCallData,
        gasLimit: this.getOptimizedGasLimit('mint'),
        value: '0'
      };
    } catch (error) {
      console.error('Error preparing initial mint:', error);
      throw new Error(`Failed to prepare initial mint: ${error.message}`);
    }
  }

  /**
   * Generate method call data untuk cron job - now supports mintAndBurn
   */
  generateMethodCallData(method, amount) {
    try {
      if (method === 'mintAndBurn') {
        // For mintAndBurn, we simulate the effect by minting more tokens
        // The smart contract would need to implement this logic
        // For now, we'll use mint method with adjusted amount
        const mintMethodAbi = MINTABLE_ERC20_ABI.find(item => 
          item.type === 'function' && item.name === 'mint'
        );
        
        if (!mintMethodAbi) {
          throw new Error('Mint method not found in ABI');
        }

        const contractInterface = new ethers.Interface([mintMethodAbi]);
        // Net effect: mint 1x amount (since 2x mint - 1x burn = 1x net mint)
        const amountInWei = ethers.parseEther(amount.toString());
        const callData = contractInterface.encodeFunctionData('mint', [amountInWei]);

        return callData;
      }

      // Original logic for single methods
      const methodAbi = MINTABLE_ERC20_ABI.find(item => 
        item.type === 'function' && item.name === method
      );
      
      if (!methodAbi) {
        throw new Error(`Method ${method} not found in ABI`);
      }

      const contractInterface = new ethers.Interface([methodAbi]);
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
      console.warn('Failed to load token info from localStorage:', error);
    }

    return null;
  }

  /**
   * Optimize gas limits for specific operations using centralized utilities
   */
  getOptimizedGasLimit(operation, contractAddress = null) {
    // Increase gas limits for mintable token operations
    const gasLimits = {
      'mint': 150000,        // Increased from 50,000 for complex ERC20
      'burn': 120000,        // Increased from 45,000 for complex ERC20  
      'mintAndBurn': 250000, // Increased for complex mint+burn operations
      'deployment': 1500000  // Already correct for deployment
    };
    
    // Check if operation is in our custom gas limits
    if (gasLimits[operation]) {
      return gasLimits[operation];
    }
    
    // Fallback to centralized utilities with higher buffer for mintable tokens
    return getOptimizedGasLimit(operation, { 
      contractType: 'mintable',
      buffer: 0.2  // Increased buffer from 0.05 to 0.2 (20% safety margin)
    });
  }

  /**
   * Get optimized gas price for token operations
   */
  getOptimizedGasPrice(priority = 'standard') {
    return getOptimizedGasPrice(priority, 'token_operation');
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
    } else if (method === 'mintAndBurn') {
      return {
        type: 'increase',
        amount: totalImpact,
        symbol: '+',
        description: `Supply will increase by ${totalImpact} tokens after ${executions} executions (net effect: mint 2x, burn 1x)`
      };
    }
    
    return {
      type: 'neutral',
      amount: 0,
      symbol: '=',
      description: 'No supply impact'
    };
  }

  /**
   * Prepare cron creation args using same format as Simple Test Contract
   */
  prepareCronArgsWithToken(contractAddress, methodName, amount, frequency, expirationOffset, blockNumber) {
    if (!contractAddress || !contractAddress.startsWith('0x')) {
      throw new Error('Invalid contract address');
    }

    if (!['mint', 'burn', 'mintAndBurn'].includes(methodName)) {
      throw new Error(`Invalid method. Supported methods: mint, burn, mintAndBurn`);
    }

    const freq = parseInt(frequency, 10);
    const expOffset = parseInt(expirationOffset, 10);
    
    if (isNaN(freq) || freq < 1 || freq > 10) {
      throw new Error('Frequency must be between 1-10');
    }

    if (isNaN(expOffset) || expOffset < 1 || expOffset > 10000) {
      throw new Error('Expiration offset must be between 1-10000');
    }

    // Convert amount to wei (18 decimals) for proper token amount
    const amountInWei = ethers.parseEther(amount.toString());
    
    console.log(`🔧 Preparing cron args for ${methodName}:`);
    console.log(`📝 Amount input: ${amount} tokens`);
    console.log(`📝 Amount in wei: ${amountInWei.toString()}`);
    console.log(`📝 Amount formatted: ${ethers.formatEther(amountInWei)} tokens`);

    const abiString = this.getCronJobAbi(methodName);
    const expirationBlock = blockNumber + expOffset;

    return [
      contractAddress,
      abiString,
      methodName,
      [amountInWei.toString()], // ✅ Convert to wei string for proper token amount
      BigInt(freq),
      BigInt(expirationBlock),
      BigInt(this.getOptimizedGasLimit(methodName)), // optimized gas limit
      getOptimizedGasPrice('standard', 'cron_creation'), // optimized maxGasPrice
      ethers.parseEther("0.1") // amountToDeposit = 0.1 HLS
    ];
  }

  /**
   * Prepare cron args with token amount-based expiration
   */
  prepareCronArgsWithTokenAmount(contractAddress, methodName, tokenAmount, frequency, amountToDeposit, calculatedExpirationBlock) {
    if (!contractAddress || !contractAddress.startsWith('0x')) {
      throw new Error('Invalid contract address');
    }

    if (!this.SUPPORTED_METHODS.includes(methodName)) {
      throw new Error(`Invalid method. Supported methods: ${this.SUPPORTED_METHODS.join(', ')}`);
    }

    const freq = parseInt(frequency, 10);
    if (isNaN(freq) || freq < 1 || freq > 1000) {
      throw new Error('Frequency must be between 1-1000');
    }

    const amount = parseFloat(amountToDeposit);
    if (isNaN(amount) || amount < 0.001) {
      throw new Error('Amount to deposit must be at least 0.001 HLS');
    }

    if (!calculatedExpirationBlock || calculatedExpirationBlock <= 0) {
      throw new Error('Invalid calculated expiration block');
    }

    // Prepare method parameters based on token amount
    const methodParams = [parseEther(tokenAmount.toString()).toString()];
    
    // Get appropriate ABI for the method
    const abiString = this.getMethodAbi(methodName);
    const amountToDepositWei = parseEther(amountToDeposit.toString());

    return [
      contractAddress,
      abiString,
      methodName,
      methodParams,
      BigInt(freq),
      BigInt(calculatedExpirationBlock),
      BigInt(this.getOptimizedGasLimit(methodName)),
      this.getOptimizedGasPrice('standard', 'cron_creation'),
      amountToDepositWei
    ];
  }

  /**
   * Get optimized gas limit for different operations
   */
  getOptimizedGasLimit(operation) {
    const gasLimits = {
      'mint': 150000,
      'burn': 120000,
      'mintAndBurn': 250000,
      'deployment': 2000000
    };
    
    return gasLimits[operation] || 100000;
  }

  /**
   * Get optimized gas price
   */
  getOptimizedGasPrice(priority = 'standard', context = 'general') {
    // Return gas price in wei
    const gasPrices = {
      'low': parseUnits("1", 9),      // 1 gwei
      'standard': parseUnits("5", 9), // 5 gwei
      'high': parseUnits("10", 9)     // 10 gwei
    };
    
    return gasPrices[priority] || gasPrices['standard'];
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
