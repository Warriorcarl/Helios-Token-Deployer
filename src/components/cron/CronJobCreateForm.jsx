import React from "react";
import AmountToDepositForm from "./AmountToDepositForm";
import "./amount-deposit-styles.css";

export default function CronJobCreateForm({
  targetAddress,
  targetMethod,
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

  const isFormValid = () => {
    const freq = parseInt(frequency);
    const amount = parseFloat(amountToDeposit);
    return freq >= 1 && freq <= 1000 && amount >= 0.001 && calculatedExpirationBlock > 0;
  };

  return (
    <div className="cron-create-form">
      <div className="deploy-step-header">
        <h3>Step 2: Create Cron Job</h3>
        <p>Configure your cron job to automatically call the deployed Simple Test Contract.</p>
      </div>

      <div className="target-info">
        <div className="info-section">
          <h4>Target Contract Information</h4>
          <div className="info-row">
            <span className="info-label">Contract Address:</span>
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
            <span className="info-label">Target Method:</span>
            <span className="info-value method-value">{targetMethod}()</span>
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
          {isCreating ? 'Creating Cron Job...' : 'Create Cron Job'}
        </button>
      </div>
    </div>
  );
}