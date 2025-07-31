import { parseUnits, parseEther } from 'viem';
import { CHRONOS_ADDRESS } from '../constants/abi/chronosAbi';
import { COUNTER_CONTRACT_ADDRESS, getIncrementAbiString } from '../constants/abi/counterAbi';

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
  validateCronParams(frequency, expirationOffset) {
    const validatedParams = {
      frequency: this.validateFrequency(frequency),
      expirationOffset: this.validateExpirationOffset(expirationOffset),
      isValid: true,
      errors: []
    };

    if (validatedParams.frequency === null) {
      validatedParams.isValid = false;
      validatedParams.errors.push('Frequency must be between 1-10');
    }

    if (validatedParams.expirationOffset === null) {
      validatedParams.isValid = false;
      validatedParams.errors.push('Expiration offset must be between 1-10000');
    }

    if (!this.currentBlock || this.currentBlock <= 0) {
      validatedParams.isValid = false;
      validatedParams.errors.push('Invalid block number');
    }

    return validatedParams;
  }

  // Validate frequency parameter
  validateFrequency(frequency) {
    const freq = parseInt(frequency, 10);
    if (isNaN(freq) || freq < 1 || freq > 10) {
      return null;
    }
    return freq;
  }

  // Validate expiration offset parameter
  validateExpirationOffset(expirationOffset) {
    const exp = parseInt(expirationOffset, 10);
    if (isNaN(exp) || exp < 1 || exp > 10000) {
      return null;
    }
    return exp;
  }

  // Calculate expiration block
  calculateExpirationBlock(expirationOffset) {
    return this.currentBlock + parseInt(expirationOffset, 10);
  }

  // Prepare create cron transaction arguments
  prepareCronCreationArgs(frequency, expirationOffset) {
    const validation = this.validateCronParams(frequency, expirationOffset);
    
    if (!validation.isValid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }

    const amountToDeposit = parseEther("1");
    const incrementAbi = getIncrementAbiString();
    const expirationBlock = this.calculateExpirationBlock(validation.expirationOffset);

    return [
      COUNTER_CONTRACT_ADDRESS,
      incrementAbi,
      "increment",
      [], // params
      BigInt(validation.frequency),
      BigInt(expirationBlock),
      BigInt(2000000), // gasLimit
      parseUnits("10", 9), // maxGasPrice
      amountToDeposit
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
      validation.errors.push('Frequency must be between 1-10');
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

  // Validate frequency for update
  validateFrequency(frequency) {
    const freq = parseInt(frequency, 10);
    if (isNaN(freq) || freq < 1 || freq > 10) {
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