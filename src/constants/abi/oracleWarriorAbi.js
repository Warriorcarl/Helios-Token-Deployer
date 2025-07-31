// Oracle Warrior Contract ABI and Configuration
// Auto-generated from frontend JSON - Do not edit manually
// Generated at: 2025-07-31T11:03:01.745Z

/**
 * Decentralized Crypto Price Oracle - No API Keys Required
 * Version: 1.0.0
 * Compiler: 0.8.0+
 * Network: Helios Testnet
 */

// Import bytecode from separate file for better development experience
import { ORACLE_WARRIOR_BYTECODE } from './oracleWarriorBytecode';

// Contract ABI
export const ORACLE_WARRIOR_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "source",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "string",
          "name": "token",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "PriceStrike",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "source",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "addedBy",
          "type": "address"
        }
      ],
      "name": "SourceAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "source",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "removedBy",
          "type": "address"
        }
      ],
      "name": "SourceRemoved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "token",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "addedBy",
          "type": "address"
        }
      ],
      "name": "TokenAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "token",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "removedBy",
          "type": "address"
        }
      ],
      "name": "TokenRemoved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "source",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalUpdates",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "WarriorBatch",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "activeSourceCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "activeTokenCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "source",
          "type": "string"
        }
      ],
      "name": "addSource",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "token",
          "type": "string"
        }
      ],
      "name": "addToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "tokens",
          "type": "string[]"
        },
        {
          "internalType": "string",
          "name": "source",
          "type": "string"
        },
        {
          "internalType": "uint256[]",
          "name": "prices",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "volumes",
          "type": "uint256[]"
        },
        {
          "internalType": "int256[]",
          "name": "changes",
          "type": "int256[]"
        }
      ],
      "name": "battalionStrike",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "volume24h",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "source",
          "type": "string"
        }
      ],
      "name": "calculateStrength",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "token",
          "type": "string"
        }
      ],
      "name": "getAveragePrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "token",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "source",
          "type": "string"
        }
      ],
      "name": "getBattleIntel",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "volume",
          "type": "uint256"
        },
        {
          "internalType": "int256",
          "name": "change",
          "type": "int256"
        },
        {
          "internalType": "uint256",
          "name": "strength",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "token",
          "type": "string"
        }
      ],
      "name": "getBestPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "bestPrice",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "bestSource",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getContractInfo",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "token",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "source",
          "type": "string"
        }
      ],
      "name": "getLatestPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSupportedSources",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSupportedTokens",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "token",
          "type": "string"
        }
      ],
      "name": "getTokenArsenal",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getWarriorStats",
      "outputs": [
        {
          "internalType": "string",
          "name": "status",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "blockTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalTokens",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalSources",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "battleCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "token",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "source",
          "type": "string"
        }
      ],
      "name": "isPriceDataFresh",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "isSourceSupported",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "isTokenSupported",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "source",
          "type": "string"
        }
      ],
      "name": "removeSource",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "token",
          "type": "string"
        }
      ],
      "name": "removeToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "token",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "source",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "volume24h",
          "type": "uint256"
        },
        {
          "internalType": "int256",
          "name": "change24h",
          "type": "int256"
        }
      ],
      "name": "strikePrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "supportedSources",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "supportedTokens",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "testConnection",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenArsenal",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalBattleCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "warriorVault",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "source",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "volume24h",
          "type": "uint256"
        },
        {
          "internalType": "int256",
          "name": "change24h",
          "type": "int256"
        },
        {
          "internalType": "uint256",
          "name": "strength",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
  // Re-export bytecode from separate file
  export { ORACLE_WARRIOR_BYTECODE };
  
  // Contract Configuration
  export const ORACLE_WARRIOR_CONFIG = {
    DEPLOYMENT_GAS_LIMIT: 5000000,
    GAS_LIMIT: 200000,
    contractName: "OracleWarrior",
    description: "Decentralized Crypto Price Oracle - No API Keys Required",
    version: "1.0.0",
    compiler: "0.8.0+",
    network: "Helios Testnet"
  };
  
  // Function to get specific function ABI
  export function getOracleWarriorFunctionAbi(functionName) {
    return ORACLE_WARRIOR_ABI.find(item => 
      item.type === 'function' && item.name === functionName
    );
  }
  
  // Function to get ABI as string for Chronos
  export function getOracleWarriorAbiString() {
    return JSON.stringify(ORACLE_WARRIOR_ABI);
  }
  
  // Function to validate if function exists
  export function isValidOracleWarriorFunction(functionName) {
    return ORACLE_WARRIOR_ABI.some(item => 
      item.type === 'function' && item.name === functionName
    );
  }
