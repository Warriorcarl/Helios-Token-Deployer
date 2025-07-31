export const CHRONOS_ADDRESS = "0x0000000000000000000000000000000000000830";

export const CHRONOS_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "contractAddress", "type": "address" },
      { "internalType": "string", "name": "abi", "type": "string" },
      { "internalType": "string", "name": "methodName", "type": "string" },
      { "internalType": "string[]", "name": "params", "type": "string[]" },
      { "internalType": "uint64", "name": "frequency", "type": "uint64" },
      { "internalType": "uint64", "name": "expirationBlock", "type": "uint64" },
      { "internalType": "uint64", "name": "gasLimit", "type": "uint64" },
      { "internalType": "uint256", "name": "maxGasPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "amountToDeposit", "type": "uint256" }
    ],
    "name": "createCron",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "cronId", "type": "uint256" },
      { "internalType": "uint256", "name": "newFrequency", "type": "uint256" },
      { "internalType": "string[]", "name": "newParams", "type": "string[]" },
      { "internalType": "uint256", "name": "newExpirationBlock", "type": "uint256" },
      { "internalType": "uint256", "name": "newGasLimit", "type": "uint256" },
      { "internalType": "uint64", "name": "newMaxGasPrice", "type": "uint64" }
    ],
    "name": "updateCron",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint64", "name": "cronId", "type": "uint64" }
    ],
    "name": "cancelCron",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];