export const CHRONOS_ADDRESS = "0x0000000000000000000000000000000000000830";

export const CHRONOS_ABI = [
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