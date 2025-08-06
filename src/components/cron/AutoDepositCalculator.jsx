import React, { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";
import "./auto-deposit-calculator-styles.css";

// Constants for gas cost calculations
const BASE_GAS_COST = parseEther("0.0001"); // Base gas cost per execution in HLS
const TOKEN_GAS_MULTIPLIER = 1.5; // Multiplier for token operations
const SAFETY_BUFFER = 1.2; // 20% safety buffer

/**
 * AutoDepositCalculator Component
 * Automatically calculates the required deposit amount based on frequency and expiration
 * Provides real-time updates and cost breakdowns
 */
export default function AutoDepositCalculator({
  frequencyBlocks,
  expirationBlocks,
  tokenMethod = null,
  onAmountCalculated,
  disabled = false,
  showDetails = true
}) {
  const [calculatedAmount, setCalculatedAmount] = useState("0");
  const [executionCount, setExecutionCount] = useState(0);
  const [gasCostPerExecution, setGasCostPerExecution] = useState("0");
  const [totalGasCost, setTotalGasCost] = useState("0");

  // Calculate gas cost per execution based on method type
  const calculateGasCostPerExecution = () => {
    let baseCost = BASE_GAS_COST;
    
    // Adjust cost for token operations
    if (tokenMethod && tokenMethod !== 'increment' && tokenMethod !== 'ping' && tokenMethod !== 'trigger') {
      baseCost = BigInt(Math.floor(Number(baseCost) * TOKEN_GAS_MULTIPLIER));
    }
    
    return baseCost;
  };

  // Calculate required deposit amount
  const calculateDepositAmount = () => {
    if (!frequencyBlocks || !expirationBlocks || frequencyBlocks <= 0 || expirationBlocks <= 0) {
      return {
        amount: "0",
        executions: 0,
        gasCostPerExec: "0",
        totalGasCost: "0"
      };
    }

    try {
      const frequency = parseInt(frequencyBlocks);
      const expiration = parseInt(expirationBlocks);
      
      // Calculate number of executions
      const executions = Math.floor(expiration / frequency);
      
      // Calculate gas cost per execution
      const gasCostPerExec = calculateGasCostPerExecution();
      
      // Calculate total gas cost
      const totalGas = gasCostPerExec * BigInt(executions);
      
      // Add safety buffer
      const totalWithBuffer = BigInt(Math.floor(Number(totalGas) * SAFETY_BUFFER));
      
      // Format amounts for display
      const amountFormatted = formatEther(totalWithBuffer);
      const gasCostPerExecFormatted = formatEther(gasCostPerExec);
      const totalGasCostFormatted = formatEther(totalGas);

      return {
        amount: amountFormatted,
        executions,
        gasCostPerExec: gasCostPerExecFormatted,
        totalGasCost: totalGasCostFormatted
      };
    } catch (error) {
      console.error("Error calculating deposit amount:", error);
      return {
        amount: "0",
        executions: 0,
        gasCostPerExec: "0",
        totalGasCost: "0"
      };
    }
  };

  // Update calculations when inputs change
  useEffect(() => {
    const result = calculateDepositAmount();
    setCalculatedAmount(result.amount);
    setExecutionCount(result.executions);
    setGasCostPerExecution(result.gasCostPerExec);
    setTotalGasCost(result.totalGasCost);

    // Notify parent component
    if (onAmountCalculated) {
      onAmountCalculated(result.amount, result.executions);
    }
  }, [frequencyBlocks, expirationBlocks, tokenMethod]);

  // Format time duration from blocks
  const formatDuration = (blocks) => {
    const seconds = blocks * 15; // 15 seconds per block (10-20 range average)
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
    } else if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  const frequencyDuration = frequencyBlocks ? formatDuration(parseInt(frequencyBlocks)) : "N/A";
  const expirationDuration = expirationBlocks ? formatDuration(parseInt(expirationBlocks)) : "N/A";

  return (
    <div className="auto-deposit-calculator">
      <div className="calculator-header">
        <h4>💰 Automatic Deposit Calculation</h4>
        <p>Amount automatically calculated based on your frequency and expiration settings</p>
      </div>

      <div className="calculation-result">
        <div className="amount-display">
          <label>Required Deposit Amount</label>
          <div className="amount-value">
            <span className="amount-number">{parseFloat(calculatedAmount).toFixed(6)}</span>
            <span className="amount-currency">HLS</span>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="calculation-details">
          <div className="detail-section">
            <h5>📊 Calculation Breakdown</h5>
            
            <div className="detail-row">
              <span className="detail-label">Execution Frequency:</span>
              <span className="detail-value">Every {frequencyDuration} ({frequencyBlocks} blocks)</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Total Duration:</span>
              <span className="detail-value">{expirationDuration} ({parseInt(expirationBlocks || 0).toLocaleString()} blocks)</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Estimated Executions:</span>
              <span className="detail-value">{executionCount} times</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Gas Cost per Execution:</span>
              <span className="detail-value">{parseFloat(gasCostPerExecution).toFixed(6)} HLS</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Total Gas Cost:</span>
              <span className="detail-value">{parseFloat(totalGasCost).toFixed(6)} HLS</span>
            </div>
            
            <div className="detail-row safety-buffer">
              <span className="detail-label">Safety Buffer (20%):</span>
              <span className="detail-value">
                +{(parseFloat(calculatedAmount) - parseFloat(totalGasCost)).toFixed(6)} HLS
              </span>
            </div>
          </div>

          {tokenMethod && tokenMethod !== 'increment' && tokenMethod !== 'ping' && tokenMethod !== 'trigger' && (
            <div className="token-method-info">
              <div className="info-badge">
                <span className="badge-icon">🪙</span>
                <span>Token method detected - Gas cost increased by {((TOKEN_GAS_MULTIPLIER - 1) * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}