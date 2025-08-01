import React, { useState } from "react";
import { MINTABLE_TOKEN_METHODS, MINTABLE_TOKEN_CONFIG } from "../../constants/abi/mintableTokenAbi";

export default function MintableTokenDeployForm({
  onDeploy,
  isDeploying,
  deployedAddress,
  onContinue,
  deploymentError
}) {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('mint');
  const [mintAmount, setMintAmount] = useState('1');

  const handleTokenNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
    if (value.length <= 30) {
      setTokenName(value);
    }
  };

  const handleTokenSymbolChange = (e) => {
    const value = e.target.value.replace(/[^A-Z]/g, '');
    if (value.length <= 5) {
      setTokenSymbol(value);
    }
  };

  const handleMintAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setMintAmount(value);
  };

  const isFormValid = tokenName.length >= 3 && tokenSymbol.length >= 2 && parseFloat(mintAmount) > 0;

  return (
    <div className="oracle-warrior-deploy-form">
      <div className="deploy-step-header">
        <h3>Step 1: Deploy Mintable ERC20 Token</h3>
        <p>Deploy an ERC20 token with public mint and burn functions that will be managed by cron jobs.</p>
      </div>

      {!deployedAddress && (
        <div className="deploy-section">
          <div className="token-config-section">
            <h4>Token Configuration</h4>
            
            <div className="parameter-group">
              <div className="input-group">
                <label>Token Name</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={handleTokenNameChange}
                  placeholder="e.g., My Mintable Token"
                  disabled={isDeploying}
                  className="token-name-input"
                  maxLength="30"
                />
                <span className="input-hint">3-30 characters, alphanumeric and spaces only</span>
              </div>

              <div className="input-group">
                <label>Token Symbol</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={handleTokenSymbolChange}
                  placeholder="e.g., MMT"
                  disabled={isDeploying}
                  className="token-symbol-input"
                  maxLength="5"
                />
                <span className="input-hint">2-5 characters, uppercase letters only</span>
              </div>
            </div>

            <div className="cron-config-section">
              <h4>Default Cron Job Settings</h4>
              
              <div className="method-selection">
                <label>Primary Cron Method:</label>
                <select 
                  value={selectedMethod} 
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  disabled={isDeploying}
                  className="method-selector"
                >
                  {MINTABLE_TOKEN_METHODS.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Default {selectedMethod === 'mint' ? 'Mint' : 'Burn'} Amount</label>
                <div className="amount-input-container">
                  <input
                    type="text"
                    value={mintAmount}
                    onChange={handleMintAmountChange}
                    placeholder="1"
                    disabled={isDeploying}
                    className="amount-input"
                  />
                  <span className="token-unit">{tokenSymbol || 'TOKEN'}</span>
                </div>
                <span className="input-hint">
                  Amount to {selectedMethod} per cron job execution
                </span>
              </div>
            </div>
          </div>

          <div className="deploy-info">
            <div className="info-item">
              <span className="info-label">Initial Supply:</span>
              <span className="info-value">0 (Dynamic supply based on minting)</span>
            </div>
            <div className="info-item">
              <span className="info-label">Decimals:</span>
              <span className="info-value">{MINTABLE_TOKEN_CONFIG.DEFAULT_DECIMALS}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mint Access:</span>
              <span className="info-value">Public (Anyone can mint)</span>
            </div>
            <div className="info-item">
              <span className="info-label">Burn Access:</span>
              <span className="info-value">Token holders only</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gas Limit:</span>
              <span className="info-value">{MINTABLE_TOKEN_CONFIG.DEPLOYMENT_GAS_LIMIT.toLocaleString()}</span>
            </div>
          </div>

          {deploymentError && (
            <div className="deployment-error">
              <span className="error-icon">❌</span>
              <span>Deployment failed: {deploymentError}</span>
            </div>
          )}

          <button
            className="deploy-token-btn"
            onClick={() => onDeploy({ tokenName, tokenSymbol, selectedMethod, mintAmount })}
            disabled={isDeploying || !isFormValid}
          >
            {isDeploying ? 'Deploying Mintable Token...' : 'Deploy Mintable ERC20 Token'}
          </button>
        </div>
      )}

      {deployedAddress && (
        <div className="deployment-success">
          <div className="success-header">
            <span className="success-icon">✅</span>
            <h4>Mintable ERC20 Token Deployed Successfully!</h4>
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
              <span className="info-label">Token Name:</span>
              <span className="info-value">{tokenName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Token Symbol:</span>
              <span className="info-value">{tokenSymbol}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Selected Cron Method:</span>
              <span className="info-value">{selectedMethod}({mintAmount} {tokenSymbol})</span>
            </div>
            <div className="info-row">
              <span className="info-label">Current Supply:</span>
              <span className="info-value">0 {tokenSymbol}</span>
            </div>
          </div>

          <div className="next-steps-info">
            <h5>What happens next:</h5>
            <ul>
              <li>✅ Token contract deployed with public mint/burn functions</li>
              <li>🔄 Create cron job to automatically {selectedMethod} {mintAmount} {tokenSymbol} tokens</li>
              <li>⏱️ Cron will execute at specified intervals</li>
              <li>📊 Token supply will change dynamically based on mint/burn operations</li>
            </ul>
          </div>

          <button
            className="continue-btn"
            onClick={() => onContinue(deployedAddress, selectedMethod, { tokenName, tokenSymbol, mintAmount })}
          >
            Continue to Create Cron Job →
          </button>
        </div>
      )}
    </div>
  );
}
