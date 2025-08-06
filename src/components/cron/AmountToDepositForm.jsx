import React, { useState, useEffect } from "react";
import { formatEther, parseEther } from "viem";

// Konstanta untuk kalkulasi
const BLOCK_TIME_SECONDS = 3; // Rata-rata waktu per block dalam detik
const SECONDS_PER_DAY = 86400;
const DAYS_IN_1_DAY = 1; // Mengubah dari 90 hari menjadi 1 hari
const MAX_DURATION_SECONDS = DAYS_IN_1_DAY * SECONDS_PER_DAY;
const MAX_BLOCKS_1_DAY = Math.floor(MAX_DURATION_SECONDS / BLOCK_TIME_SECONDS);

// Estimasi gas cost per execution (dalam wei)
const BASE_GAS_COST = parseEther("0.0001"); // 0.0001 HLS per execution
const TOKEN_GAS_MULTIPLIER = 1.5; // Token operations cost 1.5x more

export default function AmountToDepositForm({
  frequency,
  maxGasPrice,
  tokenMethod = null,
  blockNumber,
  onAmountChange,
  value = "",
  disabled = false,
  showMaxInfo = true
}) {
  const [amountToDeposit, setAmountToDeposit] = useState(value);
  const [calculatedBlocks, setCalculatedBlocks] = useState(0);
  const [calculatedDuration, setCalculatedDuration] = useState("");
  const [maxAmount, setMaxAmount] = useState("0");
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");

  // Kalkulasi estimasi gas cost per execution
  const calculateGasCostPerExecution = () => {
    let baseCost = BASE_GAS_COST;
    
    // Adjust cost based on token method
    if (tokenMethod) {
      baseCost = BigInt(Math.floor(Number(baseCost) * TOKEN_GAS_MULTIPLIER));
    }
    
    // Adjust for max gas price if provided
    if (maxGasPrice) {
      const gasLimit = BigInt(100000); // Estimated gas limit
      const gasCost = gasLimit * BigInt(maxGasPrice);
      baseCost = gasCost > baseCost ? gasCost : baseCost;
    }
    
    return baseCost;
  };

  // Kalkulasi maksimum amount untuk 1 hari
  const calculateMaxAmount = () => {
    const gasCostPerExecution = calculateGasCostPerExecution();
    const maxExecutions = Math.floor(MAX_BLOCKS_1_DAY / parseInt(frequency || 1));
    const totalGasCost = gasCostPerExecution * BigInt(maxExecutions);
    
    // Add 20% buffer untuk safety
    const bufferAmount = totalGasCost / BigInt(5); // 20%
    const maxAmountWei = totalGasCost + bufferAmount;
    
    return formatEther(maxAmountWei);
  };

  // Kalkulasi expired block berdasarkan amount
  const calculateExpiredBlock = (amount) => {
    if (!amount || !frequency || !blockNumber) return 0;
    
    try {
      const amountWei = parseEther(amount.toString());
      const gasCostPerExecution = calculateGasCostPerExecution();
      
      if (gasCostPerExecution === BigInt(0)) return 0;
      
      const possibleExecutions = Number(amountWei / gasCostPerExecution);
      const totalBlocks = possibleExecutions * parseInt(frequency);
      
      // Cap at maximum 1 hari
      const cappedBlocks = Math.min(totalBlocks, MAX_BLOCKS_1_DAY);
      
      return parseInt(blockNumber) + cappedBlocks;
    } catch (error) {
      console.error("Error calculating expired block:", error);
      return 0;
    }
  };

  // Format duration untuk display
  const formatDuration = (blocks) => {
    if (!blocks) return "0 seconds";
    
    const seconds = blocks * BLOCK_TIME_SECONDS;
    const days = Math.floor(seconds / SECONDS_PER_DAY);
    const hours = Math.floor((seconds % SECONDS_PER_DAY) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes}m`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  // Validasi amount
  const validateAmount = (amount) => {
    if (!amount || amount === "0") {
      setIsValid(false);
      setValidationMessage("Amount must be greater than 0");
      return false;
    }
    
    const numAmount = parseFloat(amount);
    const maxAmountNum = parseFloat(maxAmount);
    
    if (numAmount > maxAmountNum) {
      setIsValid(false);
      setValidationMessage(`Amount exceeds maximum for 1 day (${maxAmountNum} HLS)`);
      return false;
    }
    
    if (numAmount < 0.001) {
      setIsValid(false);
      setValidationMessage("Minimum amount is 0.001 HLS");
      return false;
    }
    
    setIsValid(true);
    setValidationMessage("");
    return true;
  };

  // Update kalkulasi ketika dependencies berubah
  useEffect(() => {
    const newMaxAmount = calculateMaxAmount();
    setMaxAmount(newMaxAmount);
    
    if (amountToDeposit) {
      const expiredBlock = calculateExpiredBlock(amountToDeposit);
      const blocks = expiredBlock - (parseInt(blockNumber) || 0);
      setCalculatedBlocks(blocks);
      setCalculatedDuration(formatDuration(blocks));
      validateAmount(amountToDeposit);
    }
  }, [frequency, maxGasPrice, tokenMethod, blockNumber, amountToDeposit]);

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    // Allow only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) return;
    
    setAmountToDeposit(value);
    
    if (value && value !== "0") {
      const expiredBlock = calculateExpiredBlock(value);
      const blocks = expiredBlock - (parseInt(blockNumber) || 0);
      setCalculatedBlocks(blocks);
      setCalculatedDuration(formatDuration(blocks));
      validateAmount(value);
      
      // Notify parent component
      if (onAmountChange) {
        onAmountChange(value, expiredBlock);
      }
    } else {
      setCalculatedBlocks(0);
      setCalculatedDuration("");
      setIsValid(false);
      setValidationMessage("Amount is required");
      
      if (onAmountChange) {
        onAmountChange("", 0);
      }
    }
  };

  // Set maximum amount
  const setMaximumAmount = () => {
    const maxVal = (parseFloat(maxAmount) * 0.95).toFixed(6); // 95% of max for safety
    setAmountToDeposit(maxVal);
    handleAmountChange({ target: { value: maxVal } });
  };

  return (
    <div className="amount-deposit-form">
      <div className="input-group">
        <label>Amount to Deposit (HLS)</label>
        <div className="amount-input-container">
          <input
            type="text"
            value={amountToDeposit}
            onChange={handleAmountChange}
            placeholder="0.1"
            disabled={disabled}
            className={`amount-input ${!isValid ? 'error' : ''}`}
          />
          <span className="currency-unit">HLS</span>
          {showMaxInfo && (
            <button 
              type="button" 
              onClick={setMaximumAmount}
              className="max-btn"
              disabled={disabled}
            >
              MAX
            </button>
          )}
        </div>
        
        {!isValid && validationMessage && (
          <span className="error-hint">{validationMessage}</span>
        )}
        
        {isValid && amountToDeposit && (
          <span className="success-hint">
            Duration: {calculatedDuration} (~{calculatedBlocks.toLocaleString()} blocks)
          </span>
        )}
      </div>
      
      {showMaxInfo && (
        <div className="max-info">
          <div className="info-row">
            <span className="info-label">Maximum for 1 day:</span>
            <span className="info-value">{parseFloat(maxAmount).toFixed(6)} HLS</span>
          </div>
          <div className="calculation-details">
            <small>
              Based on frequency: {frequency} blocks, 
              estimated gas cost: {formatEther(calculateGasCostPerExecution())} HLS per execution
            </small>
          </div>
        </div>
      )}
      
      {isValid && amountToDeposit && (
        <div className="realtime-calculation">
          <div className="calc-row">
            <span className="calc-label">Current Block:</span>
            <span className="calc-value">{blockNumber?.toLocaleString() || "-"}</span>
          </div>
          <div className="calc-row">
            <span className="calc-label">Expiration Block:</span>
            <span className="calc-value highlight">
              {calculateExpiredBlock(amountToDeposit).toLocaleString()}
            </span>
          </div>
          <div className="calc-row">
            <span className="calc-label">Estimated Executions:</span>
            <span className="calc-value">
              {Math.floor(calculatedBlocks / parseInt(frequency || 1))} times
            </span>
          </div>
        </div>
      )}
    </div>
  );
}