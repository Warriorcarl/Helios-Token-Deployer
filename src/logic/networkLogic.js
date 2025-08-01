import { formatEther } from 'viem';

// Network configuration and utilities
export const NETWORK_CONFIG = {
  HELIOS_TESTNET: {
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
  }
};

export const EXPLORER_URL = 'https://explorer.helioschainlabs.org';

// Block number management
export class BlockManager {
  constructor(publicClient) {
    this.publicClient = publicClient;
    this.currentBlock = 0;
    this.listeners = new Set();
    this.pollInterval = null;
  }

  // Add listener for block updates
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners of block update
  notifyListeners(blockNumber) {
    this.listeners.forEach(callback => callback(blockNumber));
  }

  // Start polling for block updates
  startPolling(intervalMs = 5000) {
    if (this.pollInterval) {
      this.stopPolling();
    }

    this.pollInterval = setInterval(async () => {
      await this.updateBlockNumber();
    }, intervalMs);

    // Initial update
    this.updateBlockNumber();
  }

  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Update block number
  async updateBlockNumber() {
    if (!this.publicClient) return;

    try {
      const blockNumber = await this.publicClient.getBlockNumber();
      const newBlock = Number(blockNumber);
      
      if (newBlock !== this.currentBlock) {
        const previousBlock = this.currentBlock;
        this.currentBlock = newBlock;
        this.notifyListeners(newBlock);
        
        // Debug log in development
        if (process.env.NODE_ENV === 'development' && previousBlock > 0) {
          console.log(`🔗 Block Update: ${previousBlock} → ${newBlock}`);
        }
      }
    } catch (error) {
      console.error('Error updating block number:', error);
    }
  }

  // Get current block number
  getCurrentBlock() {
    return this.currentBlock;
  }
}

// Cron data fetching logic
export class CronDataFetcher {
  constructor(publicClient) {
    this.publicClient = publicClient;
  }

  // Fetch cron jobs for a specific address
  async fetchCronJobs(address, maxPages = 10, pageSize = 25) {
    if (!this.publicClient || !address) {
      throw new Error('Public client and address are required');
    }

    let page = 1;
    let hasMore = true;
    let allCrons = [];

    while (hasMore && page <= maxPages) {
      try {
        const response = await this.publicClient.request({
          method: "eth_getAccountCronsByPageAndSize",
          params: [
            address,
            "0x" + page.toString(16),
            "0x" + pageSize.toString(16)
          ],
        });

        if (Array.isArray(response)) {
          allCrons = allCrons.concat(response);
          hasMore = response.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        throw new Error(`Failed to fetch crons on page ${page}: ${error.message}`);
      }
    }

    return allCrons;
  }

  // Fetch detailed information for a single cron job
  async fetchCronDetails(cronId) {
    if (!this.publicClient) {
      throw new Error('Public client is required');
    }

    try {
      const cronDetail = await this.publicClient.request({
        method: "eth_getCron",
        params: [cronId],
      });

      return cronDetail;
    } catch (error) {
      throw new Error(`Failed to fetch cron details for ID ${cronId}: ${error.message}`);
    }
  }

  // Fetch ETH balance for an address
  async fetchBalance(address) {
    if (!this.publicClient || !address) {
      throw new Error('Public client and address are required');
    }

    try {
      const balanceRaw = await this.publicClient.getBalance({ address });
      return Number(formatEther(balanceRaw)).toFixed(4);
    } catch (error) {
      console.error(`Error fetching balance for ${address}:`, error);
      return "0.0";
    }
  }

  // Fetch balances for multiple addresses
  async fetchBalances(addresses) {
    const balances = {};
    
    await Promise.all(
      addresses.map(async (address) => {
        balances[address] = await this.fetchBalance(address);
      })
    );

    return balances;
  }
}

// Transaction status tracker
export class TransactionTracker {
  constructor() {
    this.transactions = new Map();
  }

  // Track a new transaction
  trackTransaction(txHash, type, data = {}) {
    this.transactions.set(txHash, {
      hash: txHash,
      type,
      data,
      status: 'pending',
      timestamp: Date.now()
    });
  }

  // Update transaction status
  updateTransactionStatus(txHash, status, receipt = null) {
    const tx = this.transactions.get(txHash);
    if (tx) {
      tx.status = status;
      tx.receipt = receipt;
      tx.updatedAt = Date.now();
    }
  }

  // Get transaction by hash
  getTransaction(txHash) {
    return this.transactions.get(txHash);
  }

  // Get all transactions of a specific type
  getTransactionsByType(type) {
    return Array.from(this.transactions.values()).filter(tx => tx.type === type);
  }

  // Clean up old transactions (older than 1 hour)
  cleanup() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [hash, tx] of this.transactions.entries()) {
      if (tx.timestamp < oneHourAgo) {
        this.transactions.delete(hash);
      }
    }
  }
}

// URL and link utilities
export const URLUtils = {
  // Get transaction URL
  getTransactionUrl(txHash) {
    return `${EXPLORER_URL}/tx/${txHash}`;
  },

  // Get address URL
  getAddressUrl(address) {
    return `${EXPLORER_URL}/address/${address}`;
  },

  // Get block URL
  getBlockUrl(blockNumber) {
    return `${EXPLORER_URL}/block/${blockNumber}`;
  },

  // Format external links for HTML
  formatTransactionLink(txHash, linkText = 'View Transaction') {
    return `<a href="${this.getTransactionUrl(txHash)}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  },

  formatAddressLink(address, displayAddress = null) {
    const display = displayAddress || this.formatAddress(address);
    return `<a href="${this.getAddressUrl(address)}" target="_blank" rel="noopener noreferrer">${display}</a>`;
  },

  // Format address for display
  formatAddress(address, length = 8) {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, length)}...${address.slice(-4)}`;
  }
};