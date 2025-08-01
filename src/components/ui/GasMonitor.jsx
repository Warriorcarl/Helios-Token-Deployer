/**
 * Gas Monitor Component
 * Real-time gas usage tracking and optimization recommendations
 */

import React, { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { estimateTransactionCost, getGasOptimizationTips } from '../../utils/gasOptimization';

const GasMonitor = ({ operation, gasLimit, gasPrice, showRecommendations = true }) => {
  const [networkGasPrice, setNetworkGasPrice] = useState(null);
  const [costEstimate, setCostEstimate] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isOptimal, setIsOptimal] = useState(false);
  
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchNetworkGasPrice = async () => {
      try {
        if (publicClient) {
          const currentGasPrice = await publicClient.getGasPrice();
          setNetworkGasPrice(currentGasPrice);
        }
      } catch (error) {
        console.warn('Failed to fetch network gas price:', error);
      }
    };

    fetchNetworkGasPrice();
    const interval = setInterval(fetchNetworkGasPrice, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [publicClient]);

  useEffect(() => {
    if (gasLimit && gasPrice) {
      const estimate = estimateTransactionCost(gasLimit, gasPrice);
      setCostEstimate(estimate);
      
      // Check if gas settings are optimal
      if (networkGasPrice) {
        const isGasPriceOptimal = gasPrice <= networkGasPrice * BigInt(2); // Within 2x of network price
        const isGasLimitReasonable = gasLimit <= 1000000; // Reasonable upper limit
        setIsOptimal(isGasPriceOptimal && isGasLimitReasonable);
      }
    }
  }, [gasLimit, gasPrice, networkGasPrice]);

  useEffect(() => {
    if (operation && showRecommendations) {
      const tips = getGasOptimizationTips(operation);
      setRecommendations(tips);
    }
  }, [operation, showRecommendations]);

  const formatGasPrice = (price) => {
    if (!price) return 'Loading...';
    return `${formatUnits(price, 9)} gwei`;
  };

  const formatGasAmount = (amount) => {
    if (!amount) return 'Loading...';
    return amount.toLocaleString();
  };

  return (
    <div style={styles.gasMonitor}>
      <div style={styles.gasMonitorHeader}>
        <h4 style={styles.gasMonitorTitle}>⛽ Gas Monitor</h4>
        <div style={{
          ...styles.gasStatus,
          ...(isOptimal ? styles.gasStatusOptimal : styles.gasStatusWarning)
        }}>
          {isOptimal ? '🟢 Optimized' : '🟡 Can be optimized'}
        </div>
      </div>
      
      <div style={styles.gasMetrics}>
        <div style={styles.gasMetric}>
          <label style={styles.gasMetricLabel}>Operation:</label>
          <span style={styles.gasMetricValue}>{operation || 'Unknown'}</span>
        </div>
        
        <div style={styles.gasMetric}>
          <label style={styles.gasMetricLabel}>Gas Limit:</label>
          <span style={styles.gasMetricValue}>{formatGasAmount(gasLimit)}</span>
        </div>
        
        <div style={styles.gasMetric}>
          <label style={styles.gasMetricLabel}>Gas Price:</label>
          <span style={styles.gasMetricValue}>{formatGasPrice(gasPrice)}</span>
        </div>
        
        <div style={styles.gasMetric}>
          <label style={styles.gasMetricLabel}>Network Gas Price:</label>
          <span style={styles.gasMetricValue}>{formatGasPrice(networkGasPrice)}</span>
        </div>
        
        {costEstimate && (
          <div style={{...styles.gasMetric, ...styles.costEstimate}}>
            <label style={styles.gasMetricLabel}>Estimated Cost:</label>
            <span style={{...styles.gasMetricValue, ...styles.costEstimateValue}}>
              {formatEther(costEstimate.totalCostWei)} HLS
            </span>
          </div>
        )}
      </div>

      {showRecommendations && recommendations.length > 0 && (
        <div style={styles.gasRecommendations}>
          <h5 style={styles.gasRecommendationsTitle}>💡 Optimization Tips:</h5>
          <ul style={styles.gasRecommendationsList}>
            {recommendations.map((tip, index) => (
              <li key={index} style={styles.gasRecommendationsItem}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const styles = {
  gasMonitor: {
    background: 'rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
    fontSize: '14px'
  },
  gasMonitorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  gasMonitorTitle: {
    margin: 0,
    color: '#ffffff'
  },
  gasStatus: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  gasStatusOptimal: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e'
  },
  gasStatusWarning: {
    background: 'rgba(251, 191, 36, 0.2)',
    color: '#fbbf24'
  },
  gasMetrics: {
    display: 'grid',
    gap: '8px',
    marginBottom: '16px'
  },
  gasMetric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  gasMetricLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '13px'
  },
  gasMetricValue: {
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: "'JetBrains Mono', monospace"
  },
  costEstimate: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '8px',
    marginTop: '8px',
    fontWeight: '600'
  },
  costEstimateValue: {
    color: '#60a5fa'
  },
  gasRecommendations: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '6px',
    padding: '12px'
  },
  gasRecommendationsTitle: {
    margin: '0 0 8px 0',
    color: '#60a5fa',
    fontSize: '13px'
  },
  gasRecommendationsList: {
    margin: 0,
    paddingLeft: '16px',
    color: 'rgba(255, 255, 255, 0.8)'
  },
  gasRecommendationsItem: {
    fontSize: '12px',
    marginBottom: '4px'
  }
};

export default GasMonitor;
