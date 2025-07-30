import React, { useState } from "react";
import { formatAddr, formatTimestamp } from "../../utils/cronUtils";

const EXPLORER_URL = "https://explorer.helioschainlabs.org";

export default function CronDetailView({ cron, balance, isExpired, isLowBalance }) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="cron-details">
      <div className="cron-list-detail">
        <strong>Target:</strong>{" "}
        <a
          href={`${EXPLORER_URL}/address/${cron.contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {formatAddr(cron.contractAddress)}
        </a>
      </div>
      
      <div className="cron-list-detail">
        <strong>Alias:</strong> {formatAddr(cron.address)}{" "}
        <span className={`balance ${isLowBalance ? "low-balance" : ""}`}>
          | {balance || "0.0"} HLS
          {isLowBalance && <span className="warning-icon" title="Low balance">⚠️</span>}
        </span>
      </div>
      
      <div className="cron-list-detail">
        <strong>Freq:</strong> {cron.frequency} &nbsp;
        <strong>Exp:</strong> {cron.expirationBlock === "0" ? "∞" : cron.expirationBlock}
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
          <h4>Cron Job Details</h4>
          
          <div className="detail-row">
            <span className="detail-label">Created Block:</span>
            <span className="detail-value">{cron.createdBlock || "N/A"}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Last Run Block:</span>
            <span className="detail-value">{cron.lastRunBlock || "N/A"}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Method:</span>
            <span className="detail-value">{cron.method || "N/A"}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Gas Limit:</span>
            <span className="detail-value">{cron.gasLimit || "N/A"}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Max Gas Price:</span>
            <span className="detail-value">{cron.maxGasPrice || "N/A"} Gwei</span>
          </div>
          
          {cron.details && (
            <>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{cron.details.status || "N/A"}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Last Execution:</span>
                <span className="detail-value">{formatTimestamp(cron.details.lastExecution) || "N/A"}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Next Execution:</span>
                <span className="detail-value">{formatTimestamp(cron.details.nextExecution) || "N/A"}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}