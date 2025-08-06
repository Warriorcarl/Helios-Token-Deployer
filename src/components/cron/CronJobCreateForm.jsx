import React from "react";
import FrequencySelector from "./FrequencySelector";
import ExpirationSelector from "./ExpirationSelector";
import AutoDepositCalculator from "./AutoDepositCalculator";
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
  const [expirationBlocks, setExpirationBlocks] = React.useState("7200"); // Default to 6 hours
  const [calculatedAmount, setCalculatedAmount] = React.useState("0");
  const [executionCount, setExecutionCount] = React.useState(0);

  const handleAmountCalculated = (amount, executions) => {
    setCalculatedAmount(amount);
    setExecutionCount(executions);
  };

  const handleCreateCron = () => {
    if (calculatedAmount && parseFloat(calculatedAmount) > 0) {
      // Calculate expiration block from current block + selected duration
      const expirationBlock = blockNumber + parseInt(expirationBlocks);
      onCreateCron(calculatedAmount, expirationBlock);
    }
  };

  const isFormValid = () => {
    const freq = parseInt(frequency);
    const amount = parseFloat(calculatedAmount);
    const expiration = parseInt(expirationBlocks);
    return freq > 0 && amount > 0 && expiration > 0 && executionCount > 0;
  };

  return (
    <div className="cron-create-form">
      <div className="deploy-step-header">
        <h3>Step 2: Create Cron Job</h3>
        <p>Configure your cron job with fixed time-based scheduling to automatically call the deployed Simple Test Contract.</p>
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

      {/* Cron Parameters - New Fixed Time Options */}
      <div className="cron-parameters">
        <div className="parameter-group">
          {/* Frequency Selector - Fixed time options */}
          <FrequencySelector
            value={frequency}
            onChange={setFrequency}
            disabled={isCreating}
            label="Execution Frequency"
          />

          {/* Expiration Selector - Fixed time options */}
          <ExpirationSelector
            value={expirationBlocks}
            onChange={setExpirationBlocks}
            disabled={isCreating}
            label="Job Duration"
            currentBlock={blockNumber}
          />
        </div>

        {/* Automatic Deposit Calculator */}
        <AutoDepositCalculator
          frequencyBlocks={frequency}
          expirationBlocks={expirationBlocks}
          tokenMethod={targetMethod}
          onAmountCalculated={handleAmountCalculated}
          disabled={isCreating}
          showDetails={true}
        />

        <div className="calculation-info">
          <div className="info-row">
            <span className="info-label">Current Block:</span>
            <span className="info-value">{blockNumber?.toLocaleString() || "-"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Calculated Expiration Block:</span>
            <span className="info-value">{(blockNumber + parseInt(expirationBlocks || 0))?.toLocaleString() || "-"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Estimated Executions:</span>
            <span className="info-value">{executionCount} times</span>
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