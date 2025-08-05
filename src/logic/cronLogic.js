import { parseEther, parseUnits, formatEther } from "viem";
import { CHRONOS_ADDRESS } from '../constants/abi/chronosAbi';
import { SIMPLE_TEST_CONTRACT_CONFIG, SIMPLE_TEST_CONTRACT_BYTECODE, getSimpleContractAbiString } from '../constants/abi/simpleTestAbi';
import { getOptimizedGasLimit, getOptimizedGasPrice } from '../utils/gasOptimization';

// Cron job creation logic
export class CronJobManager {
  constructor(blockNumber = 0) {
    this.currentBlock = blockNumber;
  }

  // Update current block number
  updateBlockNumber(blockNumber) {
    this.currentBlock = blockNumber;
  }

  // Validate cron job parameters
  validateCronParams(frequency, amountToDeposit) {
    const validatedParams = {
      frequency: this.validateFrequency(frequency),
      amountToDeposit: this.validateAmountToDeposit(amountToDeposit),
      isValid: true,
      errors: []
    };

    if (validatedParams.frequency === null) {
      validatedParams.isValid = false;
      validatedParams.errors.push('Frequency must be between 1-1000');
    }

    if (validatedParams.amountToDeposit === null) {
      validatedParams.isValid = false;
      validatedParams.errors.push('Amount to deposit must be greater than 0.001 HLS');
    }

    if (!this.currentBlock || this.currentBlock <= 0) {
      validatedParams.isValid = false;
      validatedParams.errors.push('Invalid block number');
    }

    return validatedParams;
  }

  // Validate frequency parameter - updated range 1-1000
  validateFrequency(frequency) {
    const freq = parseInt(frequency, 10);
    if (isNaN(freq) || freq < 1 || freq > 1000) {
      return null;
    }
    return freq;
  }

  // Validate amount to deposit parameter
  validateAmountToDeposit(amount) {
    if (!amount) return null;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.001) {
      return null;
    }
    return numAmount;
  }

  // Calculate expiration block based on amount and frequency
  calculateExpirationBlockFromAmount(amountToDeposit, frequency) {
    if (!amountToDeposit || !frequency || !this.currentBlock) return 0;
    
    try {
      const amountWei = parseEther(amountToDeposit.toString());
      const gasCostPerExecution = parseEther("0.0001"); // Base gas cost
      
      const possibleExecutions = Number(amountWei / gasCostPerExecution);
      const totalBlocks = possibleExecutions * parseInt(frequency);
      
      // Maximum 3 months (approximately 2,592,000 blocks)
      const maxBlocks = 2592000;
      const cappedBlocks = Math.min(totalBlocks, maxBlocks);
      
      return this.currentBlock + cappedBlocks;
    } catch (error) {
      console.error("Error calculating expiration block:", error);
      return this.currentBlock + 1000; // Default fallback
    }
  }

  // Create simple cron args with amount-based expiration
  createSimpleCronArgs(frequency, amountToDeposit) {
    const validation = this.validateCronParams(frequency, amountToDeposit);
    
    if (!validation.isValid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }

    const expirationBlock = this.calculateExpirationBlockFromAmount(amountToDeposit, frequency);
    const amountToDepositWei = parseEther(amountToDeposit.toString());

    // Simple Test Contract ABI for increment function
    const incrementAbi = JSON.stringify([{
      "inputs": [],
      "name": "increment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }]);

    const SIMPLE_CONTRACT_ADDRESS = "0xAecE8330ae7AEecc6A5e59B9d1cCCa02f2dC6c38";

    return [
      SIMPLE_CONTRACT_ADDRESS,
      incrementAbi,
      "increment",
      [],
      BigInt(validation.frequency),
      BigInt(expirationBlock),
      BigInt(getOptimizedGasLimit('simple_method_call')),
      getOptimizedGasPrice('standard', 'cron_creation'),
      amountToDepositWei // Amount to deposit in wei
    ];
  }
}

// Cron job update logic
export class CronUpdateManager {
  constructor(blockNumber = 0) {
    this.currentBlock = blockNumber;
  }

  // Update current block number
  updateBlockNumber(blockNumber) {
    this.currentBlock = blockNumber;
  }

  // Validate update parameters
  validateUpdateParams(cronId, newFrequency, newExpiration) {
    const validation = {
      cronId: this.validateCronId(cronId),
      frequency: this.validateFrequency(newFrequency),
      expirationOffset: this.validateExpirationOffset(newExpiration),
      isValid: true,
      errors: []
    };

    if (validation.cronId === null) {
      validation.isValid = false;
      validation.errors.push('Invalid cron ID');
    }

    if (validation.frequency === null) {
      validation.isValid = false;
      validation.errors.push('Frequency must be between 1-1000');
    }

    if (validation.expirationOffset === null) {
      validation.isValid = false;
      validation.errors.push('Expiration offset must be between 1-10000');
    }

    return validation;
  }

  // Validate cron ID
  validateCronId(cronId) {
    const id = Number(cronId);
    if (isNaN(id) || id < 0) {
      return null;
    }
    return id;
  }

  // Validate frequency for update - updated range 1-1000
  validateFrequency(frequency) {
    const freq = parseInt(frequency, 10);
    if (isNaN(freq) || freq < 1 || freq > 1000) {
      return null;
    }
    return freq;
  }

  // Validate expiration offset for update
  validateExpirationOffset(expirationOffset) {
    const exp = parseInt(expirationOffset, 10);
    if (isNaN(exp) || exp < 1 || exp > 10000) {
      return null;
    }
    return exp;
  }

  // Prepare update cron transaction arguments
  prepareUpdateArgs(cronId, newFrequency, newExpiration, gasLimit = 1000000) {
    const validation = this.validateUpdateParams(cronId, newFrequency, newExpiration);
    
    if (!validation.isValid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }

    const newExpirationBlock = this.currentBlock + validation.expirationOffset;
    
    if (newExpirationBlock <= this.currentBlock) {
      throw new Error('New expiration block must be greater than current block');
    }

    return [
      BigInt(validation.cronId),
      BigInt(validation.frequency),
      [], // params
      BigInt(newExpirationBlock),
      BigInt(gasLimit),
      parseUnits("5", 9) // maxGasPrice
    ];
  }
}

// Cron job status logic
export class CronStatusManager {
  // Check if cron job is active
  static isActive(cron, currentBlock) {
    if (!cron || !currentBlock) return false;
    return currentBlock < parseInt(cron.expirationBlock || 0);
  }

  // Check if cron job is expired
  static isExpired(cron, currentBlock) {
    if (!cron || !currentBlock) return true;
    return currentBlock >= parseInt(cron.expirationBlock || 0);
  }

  // Get remaining blocks until expiration
  static getRemainingBlocks(cron, currentBlock) {
    if (!cron || !currentBlock) return 0;
    const remaining = parseInt(cron.expirationBlock || 0) - currentBlock;
    return Math.max(0, remaining);
  }

  // Get cron job status string
  static getStatusText(cron, currentBlock) {
    if (this.isExpired(cron, currentBlock)) {
      return 'Expired';
    }
    
    const remaining = this.getRemainingBlocks(cron, currentBlock);
    if (remaining > 0) {
      return `Active (${remaining} blocks remaining)`;
    }
    
    return 'Unknown';
  }

  // Get status color for UI
  static getStatusColor(cron, currentBlock) {
    if (this.isExpired(cron, currentBlock)) {
      return '#ea2e49'; // red
    }
    
    const remaining = this.getRemainingBlocks(cron, currentBlock);
    if (remaining > 100) {
      return '#30b18a'; // green
    } else if (remaining > 20) {
      return '#f59e0b'; // yellow
    }
    
    return '#ea2e49'; // red
  }
}

// Deposit logic
export class DepositManager {
  // Validate deposit amount
  static validateDepositAmount(amount) {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        isValid: false,
        error: 'Deposit amount must be greater than 0'
      };
    }

    if (numAmount > 1000) {
      return {
        isValid: false,
        error: 'Deposit amount too large (max 1000 HLS)'
      };
    }

    return {
      isValid: true,
      amount: numAmount
    };
  }

  // Prepare deposit transaction
  static prepareDepositTransaction(aliasAddress, amount) {
    const validation = this.validateDepositAmount(amount);
    
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (!aliasAddress || !aliasAddress.startsWith('0x')) {
      throw new Error('Invalid alias address');
    }

    return {
      to: aliasAddress,
      value: parseUnits(amount.toString(), 18),
      gas: BigInt(21000)
    };
  }
}

// Simple Test Contract deployment logic
export class SimpleTestDeploymentManager {
  constructor() {
    this.deployedContracts = new Map();
    this.availableMethods = ['increment', 'ping', 'trigger'];
  }

  // Generate random method name for deployment
  generateRandomMethodName() {
    const methods = this.availableMethods;
    const randomIndex = Math.floor(Math.random() * methods.length);
    return methods[randomIndex];
  }

  // Validate deployment parameters
  validateDeploymentParams() {
    return {
      isValid: true,
      errors: []
    };
  }

  // Prepare deployment arguments (no constructor args needed)
  prepareDeploymentArgs() {
    return [];
  }

  // Get bytecode for deployment
  getBytecode() {
    try {
      if (!SIMPLE_TEST_CONTRACT_BYTECODE || !SIMPLE_TEST_CONTRACT_BYTECODE.startsWith('0x')) {
        throw new Error('Invalid bytecode format');
      }

      return {
        bytecode: SIMPLE_TEST_CONTRACT_BYTECODE,
        isValid: true
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  // Prepare complete deployment data
  prepareDeploymentData() {
    const bytecodeData = this.getBytecode();
    
    if (!bytecodeData.isValid) {
      throw new Error(`Bytecode error: ${bytecodeData.error}`);
    }

    return {
      bytecode: bytecodeData.bytecode,
      args: this.prepareDeploymentArgs()
    };
  }

  // Store deployed contract information
  storeDeployedContract(address, txHash, blockNumber, selectedMethod) {
    const contractInfo = {
      address,
      txHash,
      blockNumber,
      selectedMethod,
      deployedAt: Date.now(),
      type: 'SimpleTestContract'
    };
    
    this.deployedContracts.set(address, contractInfo);
    return contractInfo;
  }

  // Get deployed contract info
  getDeployedContract(address) {
    return this.deployedContracts.get(address);
  }

  // Prepare cron creation args with deployed Simple Test Contract
  prepareCronArgsWithContract(contractAddress, methodName, frequency, expirationOffset, blockNumber) {
    if (!contractAddress || !contractAddress.startsWith('0x')) {
      throw new Error('Invalid contract address');
    }

    if (!this.availableMethods.includes(methodName)) {
      throw new Error(`Invalid method. Supported methods: ${this.availableMethods.join(', ')}`);
    }

    const freq = parseInt(frequency, 10);
    const expOffset = parseInt(expirationOffset, 10);
    
    if (isNaN(freq) || freq < 1 || freq > 10) {
      throw new Error('Frequency must be between 1-10');
    }

    if (isNaN(expOffset) || expOffset < 1 || expOffset > 10000) {
      throw new Error('Expiration offset must be between 1-10000');
    }

    const abiString = getSimpleContractAbiString(methodName);
    const expirationBlock = blockNumber + expOffset;

    return [
      contractAddress,
      abiString,
      methodName,
      [], // params - no parameters needed for these methods
      BigInt(freq),
      BigInt(expirationBlock),
      BigInt(getOptimizedGasLimit('simple_method_call')), // optimized gas limit
      getOptimizedGasPrice('standard', 'cron_creation'), // optimized maxGasPrice
      parseEther("0.1") // amountToDeposit = 0.001 HLS (minimal valid untuk precompile)
    ];
  }
}

// Contract deployment steps manager
export class DeploymentStepManager {
  constructor() {
    this.currentStep = 1;
    this.maxSteps = 2;
    this.stepData = new Map();
  }

  // Set current step
  setStep(step) {
    if (step < 1 || step > this.maxSteps) {
      throw new Error(`Invalid step. Must be between 1-${this.maxSteps}`);
    }
    this.currentStep = step;
  }

  // Get current step
  getCurrentStep() {
    return this.currentStep;
  }

  // Check if step is completed
  isStepCompleted(step) {
    return this.stepData.has(`step${step}_completed`);
  }

  // Mark step as completed
  completeStep(step, data = {}) {
    this.stepData.set(`step${step}_completed`, true);
    this.stepData.set(`step${step}_data`, data);
    
    // Auto advance to next step if available
    if (step < this.maxSteps) {
      this.setStep(step + 1);
    }
  }

  // Get step data
  getStepData(step) {
    return this.stepData.get(`step${step}_data`) || {};
  }

  // Reset deployment
  reset() {
    this.currentStep = 1;
    this.stepData.clear();
  }

  // Get deployment progress
  getProgress() {
    const completedSteps = Array.from({ length: this.maxSteps }, (_, i) => i + 1)
      .filter(step => this.isStepCompleted(step)).length;
    
    return {
      current: this.currentStep,
      completed: completedSteps,
      total: this.maxSteps,
      percentage: Math.round((completedSteps / this.maxSteps) * 100)
    };
  }
}