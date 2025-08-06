import React, { useState } from "react";
import { SIMPLE_CONTRACT_METHODS } from "../../constants/abi/simpleTestAbi";

export default function SimpleTestDeployForm({
  onDeploy,
  isDeploying,
  deployedAddress,
  onContinue,
  deploymentError
}) {
  const [selectedMethod, setSelectedMethod] = useState('increment');

  return (
    <div className="oracle-warrior-deploy-form">
      <div className="deploy-step-header">
        <h3>Step 1: Deploy Simple Test Contract</h3>
        <p>Deploy a simple test contract with randomized functions that will be used as the target for your cron job.</p>
      </div>

      {!deployedAddress && (
        <div className="deploy-section">
          <div className="method-selection">
            <label>Select Target Method for Cron Job:</label>
            <div className="method-options">
              {SIMPLE_CONTRACT_METHODS.map(method => (
                <button
                  key={method.value}
                  onClick={() => setSelectedMethod(method.value)}
                  disabled={isDeploying}
                  className={`method-option-btn ${selectedMethod === method.value ? 'active' : ''}`}
                >
                  <span className="method-name">{method.label}</span>
                </button>
              ))}
            </div>
            <div className="method-hint">
              This method will be called by your cron job
            </div>
          </div>

          <div className="deploy-info">
            <div className="info-item">
              <span className="info-label">Gas Limit:</span>
              <span className="info-value">500,000</span>
            </div>
            <div className="info-item">
              <span className="info-label">Contract Type:</span>
              <span className="info-value">Simple Test Contract</span>
            </div>
            <div className="info-item">
              <span className="info-label">Constructor:</span>
              <span className="info-value">No parameters required</span>
            </div>
          </div>

          {deploymentError && (
            <div className="deployment-error">
              <span className="error-icon">❌</span>
              <span>Deployment failed: {deploymentError}</span>
            </div>
          )}

          <button
            className="deploy-warrior-btn"
            onClick={() => onDeploy(selectedMethod)}
            disabled={isDeploying}
          >
            {isDeploying ? 'Deploying Simple Contract...' : 'Deploy Simple Test Contract'}
          </button>
        </div>
      )}

      {deployedAddress && (
        <div className="deployment-success">
          <div className="success-header">
            <span className="success-icon">✅</span>
            <h4>Simple Test Contract Deployed Successfully!</h4>
          </div>
          
          <div className="deployed-info">
            <div className="info-row">
              <span className="info-label">Contract Address:</span>
              <span className="info-value address-value">
                <a 
                  href={`https://explorer.helioschainlabs.org/address/${deployedAddress}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {deployedAddress}
                </a>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Selected Method:</span>
              <span className="info-value">{selectedMethod}</span>
            </div>
          </div>

          <button
            className="continue-btn"
            onClick={() => onContinue(deployedAddress, selectedMethod)}
          >
            Continue to Create Cron Job →
          </button>
        </div>
      )}
    </div>
  );
}