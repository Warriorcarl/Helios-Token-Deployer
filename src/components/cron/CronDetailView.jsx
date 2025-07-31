import React, { useState } from "react";
import { formatAddr, formatTimestamp } from "../../utils/cronUtils";

const EXPLORER_URL = "https://explorer.helioschainlabs.org";

export default function CronDetailView({ cron, balance, isExpired, isLowBalance }) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Helper function to safely get value or show N/A
  const getValue = (value) => {
    if (value === undefined || value === null || value === "" || value === "0") return "N/A";
    return String(value);
  };

  // Format gas price for display (from Wei to Gwei)
  const formatGasPrice = (gasPrice) => {
    if (!gasPrice || gasPrice === "0") return "N/A";
    try {
      const gasPriceBigInt = BigInt(gasPrice);
      if (gasPriceBigInt > BigInt(1000000000)) {
        return (Number(gasPriceBigInt) / 1000000000).toFixed(2) + " Gwei";
      }
      return gasPrice + " Wei";
    } catch (e) {
      return gasPrice + " Wei";
    }
  };

  // Format Wei to HLS
  const formatWeiToHLS = (weiValue) => {
    if (!weiValue || weiValue === "0") return "0";
    try {
      const weiBigInt = BigInt(weiValue);
      const hlsValue = Number(weiBigInt) / 1000000000000000000; // 18 decimals
      return hlsValue.toFixed(6) + " HLS";
    } catch (e) {
      return weiValue + " Wei";
    }
  };

  // Format execution stage
  const formatExecutionStage = (stage) => {
    const stages = {
      0: "Pending",
      1: "Queued", 
      2: "Executing",
      3: "Completed",
      4: "Failed"
    };
    return stages[stage] || `Stage ${stage}`;
  };

  // Format cron type
  const formatCronType = (type) => {
    const types = {
      1: "Regular Execution",
      2: "One-time Execution",
      3: "Conditional Execution"
    };
    return types[type] || `Type ${type}`;
  };

  // Format block numbers
  const formatBlockNumber = (blockNum) => {
    if (!blockNum || blockNum === "0") return "N/A";
    try {
      return Number(blockNum).toLocaleString();
    } catch (e) {
      return String(blockNum);
    }
  };

  // Get all possible field variations for a value
  const getFieldValue = (...fieldNames) => {
    for (const fieldName of fieldNames) {
      const value = cron[fieldName];
      if (value !== undefined && value !== null && value !== "" && value !== "0") {
        return String(value);
      }
    }
    return "N/A";
  };
  
  return (
    <div className="cron-details">
      <div className="cron-list-detail">
        <strong>Target:</strong>{" "}
        <a
          href={`${EXPLORER_URL}/address/${cron.contractAddress || cron.targetAddress || cron.contract}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {formatAddr(cron.contractAddress || cron.targetAddress || cron.contract)}
        </a>
      </div>
      
      <div className="cron-list-detail">
        <strong>Alias:</strong> {formatAddr(cron.address || cron.walletAddress || cron.alias)}{" "}
        <span className={`balance ${isLowBalance ? "low-balance" : ""}`}>
          | {balance || "0.0"} HLS
          {isLowBalance && <span className="warning-icon" title="Low balance">⚠️</span>}
        </span>
      </div>
      
      <div className="cron-list-detail">
        <strong>Freq:</strong> {cron.frequency || cron.interval || "N/A"} &nbsp;
        <strong>Exp:</strong> {(cron.expirationBlock === "0" || cron.expirationBlock === 0) ? "∞" : formatBlockNumber(cron.expirationBlock || cron.expiration)}
        {isExpired && <span className="warning-icon" title="Expired">⏱️</span>}
      </div>
      
      {/* Toggle details button */}
      <button 
        className="toggle-details-btn" 
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Hide Details" : "Show Details"}
      </button>
      
      {/* Expanded details section */}
      {showDetails && (
        <div className="expanded-details">
          <h4>📋 Cron Job Details</h4>
          
          <div className="detail-row">
            <span className="detail-label">🆔 Cron ID:</span>
            <span className="detail-value">{cron.id || "N/A"}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">👤 Owner Address:</span>
            <span className="detail-value">
              <a href={`${EXPLORER_URL}/address/${cron.ownerAddress}`} target="_blank" rel="noopener noreferrer">
                {formatAddr(cron.ownerAddress || "N/A")}
              </a>
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">🎯 Contract Address:</span>
            <span className="detail-value">
              <a href={`${EXPLORER_URL}/address/${cron.contractAddress}`} target="_blank" rel="noopener noreferrer">
                {formatAddr(cron.contractAddress || "N/A")}  
              </a>
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">💼 Cron Wallet:</span>
            <span className="detail-value">
              <a href={`${EXPLORER_URL}/address/${cron.address}`} target="_blank" rel="noopener noreferrer">
                {formatAddr(cron.address || "N/A")}
              </a>
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">⚙️ Method Name:</span>
            <span className="detail-value">{cron.methodName || "N/A"}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">🔄 Frequency:</span>
            <span className="detail-value">{cron.frequency} blocks</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">⏭️ Next Execution Block:</span>
            <span className="detail-value">{formatBlockNumber(cron.nextExecutionBlock)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">⏰ Expiration Block:</span>
            <span className="detail-value">{formatBlockNumber(cron.expirationBlock)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">📊 Execution Stage:</span>
            <span className="detail-value">{formatExecutionStage(cron.executionStage)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">⛽ Gas Limit:</span>
            <span className="detail-value">{formatBlockNumber(cron.gasLimit)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">💰 Max Gas Price:</span>
            <span className="detail-value">{formatGasPrice(cron.maxGasPrice)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">🔢 Total Executions:</span>
            <span className="detail-value">{cron.totalExecutedTransactions || 0}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">💸 Total Fees Paid:</span>
            <span className="detail-value">{formatWeiToHLS(cron.totalFeesPaid)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">📋 Cron Type:</span>
            <span className="detail-value">{formatCronType(cron.cronType)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">⏱️ Queue Timestamp:</span>
            <span className="detail-value">{cron.queueTimestamp === 0 ? "Not queued" : new Date(cron.queueTimestamp * 1000).toLocaleString()}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">📜 ABI JSON:</span>
            <span className="detail-value">
              <details style={{ maxWidth: '60%' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--cron-blue)' }}>
                  View ABI ({cron.abiJson ? JSON.parse(cron.abiJson).length : 0} functions)
                </summary>
                <pre style={{ 
                  fontSize: '0.8rem', 
                  background: 'var(--cron-input-bg)', 
                  padding: '8px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {cron.abiJson ? JSON.stringify(JSON.parse(cron.abiJson), null, 2) : "No ABI"}
                </pre>
              </details>
            </span>
          </div>

          {/* Status indicator */}
          <div className="detail-row">
            <span className="detail-label">🟢 Status:</span>
            <span className="detail-value">
              {isExpired ? "🔴 Expired" : 
               cron.executionStage === 0 ? "🟡 Pending" :
               cron.executionStage === 1 ? "🔵 Queued" :
               cron.executionStage === 2 ? "🟠 Executing" :
               cron.executionStage === 3 ? "🟢 Completed" :
               cron.executionStage === 4 ? "🔴 Failed" :
               "🟢 Active"}
            </span>
          </div>

          {/* Details object if present */}
          {cron.details && (
            <>
              <hr style={{ margin: '16px 0', border: '1px solid var(--cron-border)' }} />
              <h5>📈 Extended Details</h5>
              {Object.entries(cron.details).map(([key, value]) => (
                <div key={key} className="detail-row">
                  <span className="detail-label">{key}:</span>
                  <span className="detail-value">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}