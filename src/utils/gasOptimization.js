/**
 * Gas Optimization Utilities
 * Centralized gas optimization for Helios Token Deployer
 */

import { parseUnits } from 'viem';

/**
 * Optimized gas limits for different operations
 */
export const OPTIMIZED_GAS_LIMITS = {
  // Contract Deployment
  SIMPLE_CONTRACT_DEPLOYMENT: 300000,    // Simple test contracts
  MINTABLE_TOKEN_DEPLOYMENT: 1500000,    // ERC20 with mint/burn (increased for complex contracts)
  
  // Token Operations
  ERC20_TRANSFER: 30000,                 // Standard transfer
  ERC20_APPROVE: 25000,                  // Standard approve
  ERC20_MINT: 150000,                    // Mint operation (increased for complex ERC20)
  ERC20_BURN: 120000,                    // Burn operation (increased for complex ERC20)
  
  // Contract Interactions
  SIMPLE_METHOD_CALL: 50000,             // increment, ping, trigger
  CRON_JOB_CREATION: 200000,             // Chronos cron creation
  CRON_JOB_EXECUTION: 100000,            // Cron job execution overhead
  
  // Fallback
  DEFAULT_OPERATION: 100000              // Safe fallback for unknown operations
};

/**
 * Optimized gas prices for Helios network
 */
export const OPTIMIZED_GAS_PRICES = {
  // Gas prices in gwei
  FAST: 8,      // High priority transactions
  STANDARD: 5,  // Normal priority (recommended)
  SLOW: 3,      // Low priority, cost-effective
  
  // Special cases
  DEPLOYMENT: 6,     // Contract deployments
  CRON_CREATION: 5,  // Cron job creation
  BULK_OPERATIONS: 3 // Batch operations
};

/**
 * Get optimized gas limit for specific operation
 */
export function getOptimizedGasLimit(operation, options = {}) {
  const { buffer = 0.1, contractType = 'standard' } = options;
  
  let baseGasLimit;
  
  switch (operation.toLowerCase()) {
    case 'deployment':
      baseGasLimit = contractType === 'mintable' 
        ? OPTIMIZED_GAS_LIMITS.MINTABLE_TOKEN_DEPLOYMENT
        : OPTIMIZED_GAS_LIMITS.SIMPLE_CONTRACT_DEPLOYMENT;
      break;
      
    case 'mint':
      baseGasLimit = OPTIMIZED_GAS_LIMITS.ERC20_MINT;
      break;
      
    case 'burn':
      baseGasLimit = OPTIMIZED_GAS_LIMITS.ERC20_BURN;
      break;
      
    case 'mintandburn':
      baseGasLimit = OPTIMIZED_GAS_LIMITS.ERC20_MINT + OPTIMIZED_GAS_LIMITS.ERC20_BURN; // 95,000 gas
      break;
      
    case 'transfer':
      baseGasLimit = OPTIMIZED_GAS_LIMITS.ERC20_TRANSFER;
      break;
      
    case 'approve':
      baseGasLimit = OPTIMIZED_GAS_LIMITS.ERC20_APPROVE;
      break;
      
    case 'increment':
    case 'ping':
    case 'trigger':
      baseGasLimit = OPTIMIZED_GAS_LIMITS.SIMPLE_METHOD_CALL;
      break;
      
    case 'cronjob':
    case 'cron_creation':
      baseGasLimit = OPTIMIZED_GAS_LIMITS.CRON_JOB_CREATION;
      break;
      
    case 'cron_execution':
      baseGasLimit = OPTIMIZED_GAS_LIMITS.CRON_JOB_EXECUTION;
      break;
      
    default:
      baseGasLimit = OPTIMIZED_GAS_LIMITS.DEFAULT_OPERATION;
      console.warn(`Unknown operation "${operation}", using default gas limit`);
  }
  
  // Add safety buffer
  return Math.floor(baseGasLimit * (1 + buffer));
}

/**
 * Get optimized gas price in wei
 */
export function getOptimizedGasPrice(priority = 'standard', operation = null) {
  let gweiPrice;
  
  if (operation) {
    switch (operation.toLowerCase()) {
      case 'deployment':
        gweiPrice = OPTIMIZED_GAS_PRICES.DEPLOYMENT;
        break;
      case 'cron_creation':
      case 'cronjob':
        gweiPrice = OPTIMIZED_GAS_PRICES.CRON_CREATION;
        break;
      case 'bulk':
        gweiPrice = OPTIMIZED_GAS_PRICES.BULK_OPERATIONS;
        break;
      default:
        gweiPrice = OPTIMIZED_GAS_PRICES[priority.toUpperCase()] || OPTIMIZED_GAS_PRICES.STANDARD;
    }
  } else {
    gweiPrice = OPTIMIZED_GAS_PRICES[priority.toUpperCase()] || OPTIMIZED_GAS_PRICES.STANDARD;
  }
  
  return parseUnits(gweiPrice.toString(), 9);
}

/**
 * Calculate total transaction cost estimation
 */
export function estimateTransactionCost(gasLimit, gasPrice = null, priority = 'standard') {
  const effectiveGasPrice = gasPrice || getOptimizedGasPrice(priority);
  const totalCostWei = BigInt(gasLimit) * effectiveGasPrice;
  
  return {
    gasLimit: BigInt(gasLimit),
    gasPrice: effectiveGasPrice,
    totalCostWei,
    totalCostEth: totalCostWei.toString() // Convert to string for display
  };
}

/**
 * Gas optimization recommendations
 */
export function getGasOptimizationTips(operation) {
  const tips = {
    deployment: [
      "Deploy during low network activity",
      "Use optimized contract code",
      "Consider deploying multiple contracts in batch"
    ],
    mint: [
      "Batch mint operations when possible",
      "Use reasonable mint amounts",
      "Consider gas price timing"
    ],
    burn: [
      "Burn operations are typically cheaper than mints",
      "Batch burn operations for efficiency"
    ],
    cronjob: [
      "Set reasonable gas limits for cron execution",
      "Use lower gas prices for automated tasks",
      "Monitor cron job gas consumption"
    ]
  };
  
  return tips[operation] || [
    "Monitor gas prices on the network",
    "Use appropriate gas limits",
    "Consider batching operations"
  ];
}

/**
 * Validate gas parameters
 */
export function validateGasParameters(gasLimit, gasPrice) {
  const errors = [];
  
  if (gasLimit < 21000) {
    errors.push("Gas limit too low (minimum 21,000)");
  }
  
  if (gasLimit > 10000000) {
    errors.push("Gas limit too high (maximum 10,000,000)");
  }
  
  if (gasPrice && gasPrice < parseUnits("1", 9)) {
    errors.push("Gas price too low (minimum 1 gwei)");
  }
  
  if (gasPrice && gasPrice > parseUnits("100", 9)) {
    errors.push("Gas price too high (maximum 100 gwei)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  OPTIMIZED_GAS_LIMITS,
  OPTIMIZED_GAS_PRICES,
  getOptimizedGasLimit,
  getOptimizedGasPrice,
  estimateTransactionCost,
  getGasOptimizationTips,
  validateGasParameters
};
