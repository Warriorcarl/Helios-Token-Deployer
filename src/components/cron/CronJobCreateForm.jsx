import React from "react";

export default function CronJobCreateForm({
  targetAddress,
  targetMethod,
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
              max="10"
              value={frequency}
              onChange={e => setFrequency(e.target.value.replace(/[^0-9]/g,''))}
              className="frequency-input"
            />
            <span className="input-hint">1-10 blocks</span>
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
            <span className="input-hint">+ blocks (1-10000)</span>
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
            <span className="info-value">1 HLS</span>
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
          onClick={onCreateCron}
          disabled={
            isCreating ||
            parseInt(frequency) < 1 || parseInt(frequency) > 10 ||
            parseInt(expirationOffset) < 1 || parseInt(expirationOffset) > 10000
          }
        >
          {isCreating ? 'Creating Cron Job...' : 'Create Cron Job'}
        </button>
      </div>
    </div>
  );
}