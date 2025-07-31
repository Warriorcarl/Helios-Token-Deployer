// Debug utilities for development and troubleshooting
export class DebugLogger {
  constructor(enableConsole = true) {
    this.enableConsole = enableConsole;
    this.logs = [];
  }

  // Add log with timestamp
  addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    const logEntry = { timestamp, message, type };
    
    this.logs.push(logEntry);
    
    if (this.enableConsole) {
      const style = this.getConsoleStyle(type);
      console.log(`%c[${timestamp}] ${message}`, style);
    }
    
    return logEntry;
  }

  // Get console styling for different log types
  getConsoleStyle(type) {
    const styles = {
      info: 'color: #2997ff; font-weight: normal;',
      success: 'color: #30b18a; font-weight: bold;',
      error: 'color: #ea2e49; font-weight: bold;',
      warning: 'color: #f59e0b; font-weight: bold;'
    };
    return styles[type] || styles.info;
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    if (this.enableConsole) {
      console.clear();
    }
  }

  // Get all logs
  getAllLogs() {
    return [...this.logs];
  }

  // Export logs as JSON
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Transaction debugging utilities
export const TransactionDebugger = {
  logTransactionStart(txType, data) {
    console.group(`🔄 Transaction: ${txType}`);
    console.log('Data:', data);
    console.log('Timestamp:', new Date().toISOString());
  },

  logTransactionSuccess(txType, hash, receipt) {
    console.log(`✅ ${txType} Success`);
    console.log('Hash:', hash);
    console.log('Receipt:', receipt);
    console.groupEnd();
  },

  logTransactionError(txType, error) {
    console.error(`❌ ${txType} Error`);
    console.error('Error:', error);
    console.groupEnd();
  },

  logContractCall(contractAddress, functionName, args) {
    console.group(`📞 Contract Call: ${functionName}`);
    console.log('Contract:', contractAddress);
    console.log('Function:', functionName);
    console.log('Arguments:', args);
    console.groupEnd();
  }
};

// Network debugging utilities
export const NetworkDebugger = {
  logBlockUpdate(blockNumber, previousBlock) {
    if (previousBlock && blockNumber !== previousBlock) {
      console.log(`🔗 Block Update: ${previousBlock} → ${blockNumber}`);
    }
  },

  logNetworkError(error, context) {
    console.error(`🌐 Network Error in ${context}:`, error);
  },

  logRPCCall(method, params, result) {
    console.group(`🔌 RPC Call: ${method}`);
    console.log('Params:', params);
    console.log('Result:', result);
    console.groupEnd();
  }
};

// Performance debugging
export const PerformanceDebugger = {
  timers: new Map(),

  startTimer(label) {
    // Check if timer already exists and end it first
    if (this.timers.has(label)) {
      this.endTimer(label);
    }
    
    this.timers.set(label, performance.now());
    console.time(label);
  },

  endTimer(label) {
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.timeEnd(label);
      console.log(`⏱️ ${label} took ${duration.toFixed(2)}ms`);
      this.timers.delete(label);
      return duration;
    }
    return null;
  },

  // Clear all active timers
  clearAllTimers() {
    this.timers.clear();
  }
};

// Development mode checker
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Debug wrapper for components
export const withDebug = (Component, componentName) => {
  return function DebugWrappedComponent(props) {
    if (isDevelopment()) {
      console.log(`🎨 Rendering ${componentName}`, props);
    }
    return Component(props);
  };
};