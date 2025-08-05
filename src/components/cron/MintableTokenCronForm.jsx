import React from "react";
import { MINTABLE_TOKEN_CONFIG } from "../../constants/abi/mintableTokenAbi";
import AmountToDepositForm from "./AmountToDepositForm";
import "./amount-deposit-styles.css";

export default function MintableTokenCronForm({
  targetAddress,
  targetMethod,
  tokenInfo,
  frequency,
  setFrequency,
  blockNumber,
  onCreateCron,
  isCreating,
  onBack
}) {
  const [amountToDeposit, setAmountToDeposit] = React.useState("");
  const [calculatedExpirationBlock, setCalculatedExpirationBlock] = React.useState(0);

  const handleAmountChange = (amount, expirationBlock) => {
    setAmountToDeposit(amount);
    setCalculatedExpirationBlock(expirationBlock);
  };

  const handleCreateCron = () => {
    if (amountToDeposit && calculatedExpirationBlock > 0) {
      onCreateCron(amountToDeposit, calculatedExpirationBlock);
    }
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

  const isFormValid = () => {
    const freq = parseInt(frequency);
    const amount = parseFloat(amountToDeposit);
    return freq >= 1 && freq <= 1000 && amount >= 0.001 && calculatedExpirationBlock > 0;
  };

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
              max="1000"
              value={frequency}
              onChange={e => setFrequency(e.target.value.replace(/[^0-9]/g,''))}
              className="frequency-input-enhanced"
            />
            <div className="frequency-range-info">
              <div className="range-label">Range: 1-1000 blocks</div>
              <div className="range-examples">
                Examples: 1 (fastest), 10 (every ~30s), 100 (every ~5min), 1000 (every ~50min)
              </div>
            </div>
          </div>

          {/* Amount to Deposit Form */}
          <AmountToDepositForm
            frequency={frequency}
            tokenMethod={targetMethod}
            maxGasPrice={methodDetails.gasUsage}
            blockNumber={blockNumber}
            onAmountChange={handleAmountChange}
            value={amountToDeposit}
            disabled={isCreating}
          />
        </div>

        <div className="calculation-info">
          <div className="info-row">
            <span className="info-label">Current Block:</span>
            <span className="info-value">{blockNumber?.toLocaleString() || "-"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Calculated Expiration:</span>
            <span className="info-value">{calculatedExpirationBlock?.toLocaleString() || "-"}</span>
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
          onClick={handleCreateCron}
          disabled={isCreating || !isFormValid()}
        >
          {isCreating ? 'Creating Token Cron Job...' : `Create ${methodDetails.action} Cron Job`}
        </button>
      </div>
    </div>
  );
}
