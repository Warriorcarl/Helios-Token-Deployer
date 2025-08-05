import React, { useState } from "react";
import AmountToDepositForm from "./AmountToDepositForm";
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
  const [amountToDeposit, setAmountToDeposit] = useState("");
  const [calculatedExpirationBlock, setCalculatedExpirationBlock] = useState(0);

  const handleCreateCron = () => {
    if (amountToDeposit && calculatedExpirationBlock > 0) {
      onCreateCron(PREDEFINED_CONTRACT.address, selectedMethod, amountToDeposit, calculatedExpirationBlock);
    }
  };

  const handleAmountChange = (amount, expirationBlock) => {
    setAmountToDeposit(amount);
    setCalculatedExpirationBlock(expirationBlock);
  };

  const isFormValid = () => {
    const freq = parseInt(frequency);
    const amount = parseFloat(amountToDeposit);
    return freq >= 1 && freq <= 1000 && amount >= 0.001 && calculatedExpirationBlock > 0;
  };

  return (
    <div className="simple-cron-form">
      <div className="deploy-step-header">
        <h3>Create Simple Cron Job</h3>
        <p>Create a cron job directly using pre-deployed Simple Test Contract without deployment step.</p>
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
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="method-select"
        >
          {PREDEFINED_CONTRACT.methods.map(method => (
            <option key={method} value={method}>{method}()</option>
          ))}
        </select>
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

      {/* Cron Parameters */}
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
