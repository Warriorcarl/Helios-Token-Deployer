import React, { useState } from "react";
import { MINTABLE_TOKEN_CONFIG } from "../../constants/abi/mintableTokenAbi";
import { getOptimizedGasLimit, getOptimizedGasPrice } from "../../utils/gasOptimization";
import { MintableTokenUtils } from "../../logic/mintableTokenLogic";
import GasMonitor from "../ui/GasMonitor";

export default function MintableTokenDeployForm({
  onDeploy,
  isDeploying,
  deployedAddress,
  onContinue,
  deploymentError
}) {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');

  const handleTokenNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
    if (value.length <= 30) {
      setTokenName(value);
      // Auto-generate symbol when name changes
      if (value.trim()) {
        const autoSymbol = MintableTokenUtils.generateSymbolFromName(value);
        setTokenSymbol(autoSymbol);
      } else {
        setTokenSymbol('');
      }
    }
  };

  const handleTokenSymbolChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (value.length <= 5) {
      setTokenSymbol(value);
    }
  };

  const handleRandomizeToken = () => {
    const randomData = MintableTokenUtils.generateRandomTokenData();
    setTokenName(randomData.name);
    setTokenSymbol(randomData.symbol);
  };

  const isFormValid = tokenName.length >= 3 && tokenSymbol.length >= 2;

  return (
    <div className="oracle-warrior-deploy-form">
      <div className="deploy-step-header">
        <h3>Step 1: Deploy Mintable ERC20 Token</h3>
        <p>Deploy an ERC20 token with public mint and burn functions that will be managed by cron jobs.</p>
      </div>

      {!deployedAddress && (
        <div className="deploy-section">
          <div className="token-config-section">
            <div className="config-header">
              <h4>Token Configuration</h4>
              <button
                type="button"
                className="randomize-btn"
                onClick={handleRandomizeToken}
                disabled={isDeploying}
                title="Generate random token name and symbol"
              >
                🎲 Randomize
              </button>
            </div>
            
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
                <label>Token Symbol (Auto-generated)</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={handleTokenSymbolChange}
                  placeholder="e.g., MMT"
                  disabled={isDeploying}
                  className="token-symbol-input"
                  maxLength="5"
                />
                <span className="input-hint">2-5 characters, auto-follows token name or edit manually</span>
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

          {/* Gas Monitor */}
          <GasMonitor 
            operation="deployment"
            gasLimit={getOptimizedGasLimit('deployment', { contractType: 'mintable' })}
            gasPrice={getOptimizedGasPrice('standard', 'deployment')}
            showRecommendations={true}
          />

          {deploymentError && (
            <div className="deployment-error">
              <span className="error-icon">❌</span>
              <span>Deployment failed: {deploymentError}</span>
            </div>
          )}

          <button
            className="deploy-token-btn"
            onClick={() => onDeploy({ tokenName, tokenSymbol })}
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
              <span className="info-label">Current Supply:</span>
              <span className="info-value">0 {tokenSymbol}</span>
            </div>
          </div>

          <div className="next-steps-info">
            <h5>What happens next:</h5>
            <ul>
              <li>✅ Token contract deployed with public mint/burn functions</li>
              <li>🔄 Configure cron job settings and token value</li>
              <li>⏱️ Cron will execute at specified intervals</li>
              <li>📊 Token supply will change dynamically based on mint/burn operations</li>
            </ul>
          </div>

          <button
            className="continue-btn"
            onClick={() => onContinue(deployedAddress, null, { tokenName, tokenSymbol })}
          >
            Continue to Configure Cron Job →
          </button>
        </div>
      )}
    </div>
  );
}
