import React from "react";
import { MINTABLE_TOKEN_CONFIG } from "../../constants/abi/mintableTokenAbi";

export default function MintableTokenCronForm({
  targetAddress,
  targetMethod,
  tokenInfo,
  frequency,
  setFrequency,
  expirationOffset,
  setExpirationOffset,
  blockNumber,
  onCreateCron,
  isCreating,
  onBack
}) {
  const calculateExpirationBlock = () => {
    if (!blockNumber || !expirationOffset) return "-";
    return Number(blockNumber) + Number(expirationOffset);
  };

  const getMethodDescription = () => {
    if (targetMethod === 'mint') {
      return `Mint ${tokenInfo.mintAmount} ${tokenInfo.tokenSymbol} tokens every ${frequency} blocks`;
    } else if (targetMethod === 'burn') {
      return `Burn ${tokenInfo.mintAmount} ${tokenInfo.tokenSymbol} tokens every ${frequency} blocks`;
    } else if (targetMethod === 'mintAndBurn') {
      return `Mint & Burn ${tokenInfo.mintAmount} ${tokenInfo.tokenSymbol} tokens every ${frequency} blocks (net +${tokenInfo.mintAmount})`;
    }
    return `Execute ${targetMethod}() every ${frequency} blocks`;
  };

  const getMethodDetails = () => {
    if (targetMethod === 'mint') {
      return {
        icon: "🪙",
        action: "Minting",
        description: "Creates new tokens and adds them to the total supply",
        effect: "Supply increases",
        gasUsage: MINTABLE_TOKEN_CONFIG.MINT_GAS_LIMIT
      };
    } else if (targetMethod === 'burn') {
      return {
        icon: "🔥",
        action: "Burning", 
        description: "Destroys tokens from the caller's balance",
        effect: "Supply decreases",
        gasUsage: MINTABLE_TOKEN_CONFIG.BURN_GAS_LIMIT
      };
    } else if (targetMethod === 'mintAndBurn') {
      return {
        icon: "🔄",
        action: "Minting & Burning",
        description: "Creates new tokens and destroys existing tokens from the caller's balance",
        effect: "Net supply change",
        gasUsage: MINTABLE_TOKEN_CONFIG.MINT_GAS_LIMIT + MINTABLE_TOKEN_CONFIG.BURN_GAS_LIMIT
      };
    }
    return {
      icon: "⚙️",
      action: "Executing",
      description: "Calls the specified method",
      effect: "Method-dependent",
      gasUsage: 100000
    };
  };

  const methodDetails = getMethodDetails();

  return (
    <div className="mintable-token-cron-form">
      <div className="deploy-step-header">
        <h3>Step 2: Create Mintable Token Cron Job</h3>
        <p>Configure your cron job to automatically manage your mintable ERC20 token.</p>
      </div>

      <div className="target-info">
        <div className="info-section">
          <h4>Target Token Information</h4>
          <div className="info-row">
            <span className="info-label">Token Contract:</span>
            <span className="info-value address-value">
              <a 
                href={`https://explorer.helioschainlabs.org/address/${targetAddress}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                {targetAddress}
              </a>
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Token Name:</span>
            <span className="info-value">{tokenInfo.tokenName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Token Symbol:</span>
            <span className="info-value">{tokenInfo.tokenSymbol}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Cron Method:</span>
            <span className="info-value method-value">
              {methodDetails.icon} {targetMethod}({tokenInfo.mintAmount} {tokenInfo.tokenSymbol})
            </span>
          </div>
        </div>
      </div>

      <div className="method-details-section">
        <div className="method-card">
          <div className="method-header">
            <span className="method-icon">{methodDetails.icon}</span>
            <h4>{methodDetails.action} Operation</h4>
          </div>
          <div className="method-body">
            <p className="method-description">{methodDetails.description}</p>
            <div className="method-stats">
              <div className="stat-item">
                <span className="stat-label">Effect:</span>
                <span className="stat-value">{methodDetails.effect}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Amount per execution:</span>
                <span className="stat-value">{tokenInfo.mintAmount} {tokenInfo.tokenSymbol}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Estimated gas:</span>
                <span className="stat-value">{methodDetails.gasUsage.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cron-parameters">
        <div className="parameter-group">
          <div className="input-group">
            <label>Frequency (blocks)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={frequency}
              onChange={e => setFrequency(e.target.value.replace(/[^0-9]/g,''))}
              className="frequency-input"
            />
            <span className="input-hint">1-10 blocks between executions</span>
          </div>

          <div className="input-group">
            <label>Expiration Offset</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={expirationOffset}
              onChange={e => setExpirationOffset(e.target.value.replace(/[^0-9]/g,''))}
              className="expiration-input"
            />
            <span className="input-hint">+ blocks until job expires (1-10000)</span>
          </div>
        </div>

        <div className="calculation-info">
          <div className="info-row">
            <span className="info-label">Current Block:</span>
            <span className="info-value">{blockNumber || "-"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Expiration Block:</span>
            <span className="info-value">{calculateExpirationBlock()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Deposit Amount:</span>
            <span className="info-value">0.001 HLS</span>
          </div>
          <div className="info-row">
            <span className="info-label">Job Description:</span>
            <span className="info-value description-value">{getMethodDescription()}</span>
          </div>
        </div>
      </div>

      <div className="projected-impact">
        <h4>Projected Token Supply Impact</h4>
        <div className="impact-calculation">
          {targetMethod === 'mint' ? (
            <div className="impact-info">
              <div className="impact-row">
                <span>Per execution:</span>
                <span className="positive">+{tokenInfo.mintAmount} {tokenInfo.tokenSymbol}</span>
              </div>
              <div className="impact-row">
                <span>After 10 executions:</span>
                <span className="positive">+{(parseFloat(tokenInfo.mintAmount) * 10).toFixed(2)} {tokenInfo.tokenSymbol}</span>
              </div>
              <div className="impact-row">
                <span>After 100 executions:</span>
                <span className="positive">+{(parseFloat(tokenInfo.mintAmount) * 100).toFixed(2)} {tokenInfo.tokenSymbol}</span>
              </div>
            </div>
          ) : targetMethod === 'burn' ? (
            <div className="impact-info">
              <div className="impact-row">
                <span>Per execution:</span>
                <span className="negative">-{tokenInfo.mintAmount} {tokenInfo.tokenSymbol}</span>
              </div>
              <div className="impact-note">
                <span className="note-icon">⚠️</span>
                <span>Burn operations require sufficient token balance</span>
              </div>
            </div>
          ) : targetMethod === 'mintAndBurn' ? (
            <div className="impact-info">
              <div className="impact-row">
                <span>Per execution:</span>
                <span className="positive">+{tokenInfo.mintAmount} {tokenInfo.tokenSymbol} (net effect)</span>
              </div>
              <div className="impact-row">
                <span>After 10 executions:</span>
                <span className="positive">+{(parseFloat(tokenInfo.mintAmount) * 10).toFixed(2)} {tokenInfo.tokenSymbol}</span>
              </div>
              <div className="impact-row">
                <span>After 100 executions:</span>
                <span className="positive">+{(parseFloat(tokenInfo.mintAmount) * 100).toFixed(2)} {tokenInfo.tokenSymbol}</span>
              </div>
              <div className="impact-note">
                <span className="note-icon">🔄</span>
                <span>Mint & Burn operations: Creates 2x amount, burns 1x amount (net +1x)</span>
              </div>
            </div>
          ) : (
            <div className="impact-info">
              <div className="impact-row">
                <span>Per execution:</span>
                <span className="neutral">Unknown impact</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="back-btn"
          onClick={onBack}
          disabled={isCreating}
        >
          ← Back to Step 1
        </button>
        
        <button
          className="create-cron-btn"
          onClick={onCreateCron}
          disabled={
            isCreating ||
            parseInt(frequency) < 1 || parseInt(frequency) > 10 ||
            parseInt(expirationOffset) < 1 || parseInt(expirationOffset) > 10000
          }
        >
          {isCreating ? 'Creating Token Cron Job...' : `Create ${methodDetails.action} Cron Job`}
        </button>
      </div>
    </div>
  );
}
