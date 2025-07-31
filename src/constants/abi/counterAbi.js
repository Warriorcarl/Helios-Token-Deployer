// Counter contract ABI for increment functionality
export const COUNTER_CONTRACT_ADDRESS = "0x0B036881a81A3f25b01702845DB8F555E448B07e";

export const COUNTER_ABI = [
  {
    "inputs": [],
    "name": "counter",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Helper function to get increment method ABI as JSON string
export const getIncrementAbiString = () => {
  return JSON.stringify([
    { 
      "inputs": [], 
      "name": "increment", 
      "outputs": [], 
      "stateMutability": "nonpayable", 
      "type": "function" 
    }
  ]);
};