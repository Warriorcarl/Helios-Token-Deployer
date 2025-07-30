// Helper to format addresses
export function formatAddr(addr) {
  if (!addr) return "";
  return addr.slice(0, 7) + "..." + addr.slice(-6);
}

// Helper to safely stringify JSON with BigInt
export function safeJsonStringify(obj) {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
}

// Helper to extract revert reason from error
export function extractRevertReason(error) {
  if (!error) return "Unknown error";
  
  // Try to extract specific error data
  if (error.details) return error.details;
  if (error.message && error.message.includes('reverted with the following reason:'))
    return error.message.split('reverted with the following reason:')[1].trim();
  if (error.message && error.message.includes('reverted: '))
    return error.message.split('reverted: ')[1].trim();
  if (error.message && error.message.includes('invalid cron doesn\'t exists'))
    return "Cron ID doesn't exist or you're not the owner";
  if (error.data) return `Error data: ${error.data}`;
  
  return error.message || "Transaction failed";
}

// Determine if a cron is expired based on expiration block and current block
export function isCronExpired(cron, currentBlock) {
  if (!cron || !cron.expirationBlock || cron.expirationBlock === "0") return false;
  return parseInt(cron.expirationBlock) <= currentBlock;
}

// Check if cron wallet has low balance
export function hasLowBalance(balance) {
  return parseFloat(balance || "0") < 0.001;
}

// Format timestamp to readable date
export function formatTimestamp(timestamp) {
  if (!timestamp) return "N/A";
  
  // Convert Unix timestamp to JavaScript Date object
  const date = new Date(parseInt(timestamp) * 1000);
  
  // Format the date
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}