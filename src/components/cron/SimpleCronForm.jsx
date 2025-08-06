import React, { useState } from "react";
import FrequencySelector from "./FrequencySelector";
import ExpirationSelector from "./ExpirationSelector";
import AutoDepositCalculator from "./AutoDepositCalculator";
import "./amount-deposit-styles.css";

const PREDEFINED_CONTRACT = {
  address: '0xAecE8330ae7AEecc6A5e59B9d1cCCa02f2dC6c38',
  name: 'Simple Test Contract',
  methods: ['increment', 'ping', 'trigger']
};

export default function SimpleCronForm({
  frequency,
  setFrequency,
  blockNumber,
  onCreateCron,
  isCreating
}) {
  const [selectedMethod, setSelectedMethod] = useState('increment');
  const [expirationBlocks, setExpirationBlocks] = useState("7200"); // Default to 6 hours
  const [calculatedAmount, setCalculatedAmount] = useState("0");
  const [executionCount, setExecutionCount] = useState(0);

  const handleCreateCron = () => {
    if (calculatedAmount && parseFloat(calculatedAmount) > 0) {
      // Calculate expiration block from current block + selected duration
      const expirationBlock = blockNumber + parseInt(expirationBlocks);
      onCreateCron(PREDEFINED_CONTRACT.address, selectedMethod, calculatedAmount, expirationBlock);
    }
  };

  const handleAmountCalculated = (amount, executions) => {
    setCalculatedAmount(amount);
    setExecutionCount(executions);
  };

  const isFormValid = () => {
    const freq = parseInt(frequency);
    const amount = parseFloat(calculatedAmount);
    const expiration = parseInt(expirationBlocks);
    return freq > 0 && amount > 0 && expiration > 0 && executionCount > 0;
  };

  return (
    <div className="simple-cron-form">
      <div className="deploy-step-header">
        <h3>Create Simple Cron Job</h3>
        <p>Create a cron job directly using pre-deployed Simple Test Contract with fixed time-based scheduling.</p>
      </div>

      {/* Contract Info Display */}
      <div className="contract-info-display">
        <h4>Target Contract</h4>
        <div className="contract-card">
          <div className="contract-info">
            <div className="contract-name">{PREDEFINED_CONTRACT.name}</div>
            <div className="contract-address">{PREDEFINED_CONTRACT.address}</div>
          </div>
          <div className="contract-methods">
            Available methods: {PREDEFINED_CONTRACT.methods.join(', ')}
          </div>
        </div>
      </div>

      {/* Method Selection */}
      <div className="method-selection">
        <h4>Select Method</h4>
        <div className="method-options">
          {PREDEFINED_CONTRACT.methods.map(method => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              disabled={isCreating}
              className={`method-option-btn ${selectedMethod === method ? 'active' : ''}`}
            >
              <span className="method-name">{method}()</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target Info */}
      <div className="target-info">
        <div className="info-section">
          <h4>Target Contract Information</h4>
          <div className="info-row">
            <span className="info-label">Contract Address:</span>
            <span className="info-value address-value">
              <a 
                href={`https://explorer.helioschainlabs.org/address/${PREDEFINED_CONTRACT.address}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                {PREDEFINED_CONTRACT.address}
              </a>
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Target Method:</span>
            <span className="info-value method-value">{selectedMethod}()</span>
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
          tokenMethod={selectedMethod}
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

      {/* Action Button */}
      <div className="action-buttons">        
        <button
          className="create-cron-btn"
          onClick={handleCreateCron}
          disabled={isCreating || !isFormValid()}
        >
          {isCreating ? 'Creating Cron Job...' : 'Create Simple Cron Job'}
        </button>
      </div>
    </div>
  );
}
