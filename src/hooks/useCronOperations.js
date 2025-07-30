import { useState } from "react";
import { useContractWrite, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import { parseUnits } from "viem";
import { CHRONOS_ADDRESS, CHRONOS_ABI } from "../constants/abi/chronosAbi";
import { formatAddr, extractRevertReason } from "../utils/cronUtils";

const EXPLORER_URL = "https://explorer.helioschainlabs.org";

export default function useCronOperations(onAction, blockNumber, refreshData) {
  const [cancelingId, setCancelingId] = useState(null);
  const [actionState, setActionState] = useState({
    type: null,
    data: null,
    logSent: false
  });

  // Contract interaction hooks
  const {
    writeContract: writeUpdate,
    data: updateTxHash,
    isPending: isUpdatePending,
    error: updateError
  } = useContractWrite();
  
  const {
    writeContract: writeCancel,
    data: cancelTxHash,
    isPending: isCancelPending,
    error: cancelError
  } = useContractWrite();
  
  const {
    sendTransaction,
    data: depositTxHash,
    isPending: isDepositPending,
    error: depositError
  } = useSendTransaction();

  // Wait for transaction receipts
  const { isLoading: isUpdateTxLoading, isSuccess: isUpdateTxSuccess } = 
    useWaitForTransactionReceipt({ hash: updateTxHash });
  const { isLoading: isCancelTxLoading, isSuccess: isCancelTxSuccess } = 
    useWaitForTransactionReceipt({ hash: cancelTxHash });
  const { isLoading: isDepositTxLoading, isSuccess: isDepositTxSuccess } = 
    useWaitForTransactionReceipt({ hash: depositTxHash });

  // Update status tracking
  const updateStatus = {
    isPending: isUpdatePending,
    isLoading: isUpdateTxLoading,
    isSuccess: isUpdateTxSuccess,
    error: updateError,
    txHash: updateTxHash
  };

  // Cancel status tracking
  const cancelStatus = {
    isPending: isCancelPending,
    isLoading: isCancelTxLoading,
    isSuccess: isCancelTxSuccess,
    error: cancelError,
    txHash: cancelTxHash
  };

  // Deposit status tracking
  const depositStatus = {
    isPending: isDepositPending,
    isLoading: isDepositTxLoading,
    isSuccess: isDepositTxSuccess,
    error: depositError,
    txHash: depositTxHash
  };

  // Handle transaction logging
  const handleTransactionLogging = () => {
    if (!actionState.type || actionState.logSent) return;
    
    // UPDATE transaction
    if (actionState.type === 'update') {
      if (isUpdateTxLoading && !actionState.logSent) {
        onAction && onAction("Awaiting update confirmation...", "info");
        setActionState(prev => ({ ...prev, logSent: true }));
      }
      
      if (isUpdateTxSuccess && updateTxHash) {
        onAction && onAction(
          `<span style="color:#30b18a"><b>Cron Updated:</b><br/>
          CronId: ${actionState.data.cronId}<br/>
          Frequency: ${actionState.data.frequency}<br/>
          Expiration Block: ${actionState.data.expirationBlock}<br/>
          Target: <a href="${EXPLORER_URL}/address/${actionState.data.contractAddress}" target="_blank" rel="noopener noreferrer">${formatAddr(actionState.data.contractAddress)}</a><br/>
          <a href="${EXPLORER_URL}/tx/${updateTxHash}" target="_blank" rel="noopener noreferrer">View Transaction</a></span>`,
          "success"
        );
        setActionState({ type: null, data: null, logSent: false });
        refreshData(); // Refresh the data after successful update
      }
      
      if (updateError) {
        let errorMsg = updateError.message || String(updateError);
        if (errorMsg.includes("doesn't exists") || errorMsg.includes("invalid cron")) {
          errorMsg = "Cron job doesn't exist or you're not the owner";
        }
        onAction && onAction(`<span style="color:#ea2e49">Error: ${errorMsg}</span>`, "error");
        setActionState({ type: null, data: null, logSent: false });
      }
    }
    
    // CANCEL transaction
    if (actionState.type === 'cancel') {
      if (isCancelTxLoading && !actionState.logSent) {
        onAction && onAction("Awaiting cancel confirmation...", "info");
        setActionState(prev => ({ ...prev, logSent: true }));
      }
      
      if (isCancelTxSuccess && cancelTxHash) {
        onAction && onAction(
          `<span style="color:#30b18a"><b>Cron Cancelled:</b><br/>
          CronId: ${actionState.data.cronId}<br/>
          Target: <a href="${EXPLORER_URL}/address/${actionState.data.contractAddress}" target="_blank" rel="noopener noreferrer">${formatAddr(actionState.data.contractAddress)}</a><br/>
          <a href="${EXPLORER_URL}/tx/${cancelTxHash}" target="_blank" rel="noopener noreferrer">View Transaction</a></span>`,
          "success"
        );
        setActionState({ type: null, data: null, logSent: false });
        refreshData(); // Refresh the data after successful cancellation
      }
      
      if (cancelError) {
        let errorMsg = cancelError.message || String(cancelError);
        if (errorMsg.includes("doesn't exists") || errorMsg.includes("invalid cron")) {
          errorMsg = "Cron job doesn't exist or you're not the owner";
        }
        onAction && onAction(`<span style="color:#ea2e49">Error: ${errorMsg}</span>`, "error");
        setActionState({ type: null, data: null, logSent: false });
      }
    }
    
    // DEPOSIT transaction
    if (actionState.type === 'deposit') {
      if (isDepositTxLoading && !actionState.logSent) {
        onAction && onAction("Awaiting deposit confirmation...", "info");
        setActionState(prev => ({ ...prev, logSent: true }));
      }
      
      if (isDepositTxSuccess && depositTxHash) {
        onAction && onAction(
          `<span style="color:#30b18a"><b>Deposit Success:</b><br/>
          Cron Wallet: ${formatAddr(actionState.data.aliasAddress)}<br/>
          Amount: ${actionState.data.amount} HLS<br/>
          <a href="${EXPLORER_URL}/tx/${depositTxHash}" target="_blank" rel="noopener noreferrer">View Transaction</a></span>`,
          "success"
        );
        setActionState({ type: null, data: null, logSent: false });
        refreshData(); // Refresh the data after successful deposit
      }
      
      if (depositError) {
        onAction && onAction(`<span style="color:#ea2e49">Error: ${extractRevertReason(depositError)}</span>`, "error");
        setActionState({ type: null, data: null, logSent: false });
      }
    }
  };

  // Effect to handle transaction logging
  useState(() => {
    handleTransactionLogging();
  }, [
    actionState,
    isUpdateTxLoading, isUpdateTxSuccess, updateTxHash, updateError,
    isCancelTxLoading, isCancelTxSuccess, cancelTxHash, cancelError,
    isDepositTxLoading, isDepositTxSuccess, depositTxHash, depositError
  ]);

  // Operations
  const handleUpdate = (cron, formVals, setEditingId) => {
    // Ensure cron ID is a valid number
    if (isNaN(Number(cron.id))) {
      onAction && onAction(`<span style="color:#ea2e49">Invalid cron ID: Not a number</span>`, "error");
      return;
    }
    
    let freq = parseInt(formVals.newFrequency, 10);
    let addExp = parseInt(formVals.newExpiration, 10);
    
    if (isNaN(freq) || freq < 1) freq = 1;
    if (freq > 10) freq = 10;
    if (isNaN(addExp) || addExp < 1) addExp = 1;
    if (addExp > 10000) addExp = 10000;
    
    const newExpirationBlock = (blockNumber || 0) + addExp;
    if (newExpirationBlock <= (blockNumber || 0)) return;
    
    if (onAction) onAction(`<span style="color:#2997ff">Submitting updateCron for CronId: <b>${cron.id}</b> ...</span>`, "info");
    
    try {
      // Ensure proper BigInt conversions
      const cronIdBigInt = BigInt(Number(cron.id));
      const freqBigInt = BigInt(freq);
      const expBigInt = BigInt(newExpirationBlock);
      const gasLimitBigInt = BigInt(Number(cron.gasLimit || 1000000));
      
      setActionState({
        type: 'update',
        data: { 
          cronId: cron.id, 
          frequency: freq, 
          expirationBlock: newExpirationBlock,
          contractAddress: cron.contractAddress
        },
        logSent: false
      });
      
      writeUpdate({
        address: CHRONOS_ADDRESS,
        abi: CHRONOS_ABI,
        functionName: "updateCron",
        args: [
          cronIdBigInt,
          freqBigInt,
          [],
          expBigInt,
          gasLimitBigInt,
          parseUnits("5", 9)
        ],
        gas: BigInt(500000) // Fixed gas to avoid estimation issues
      });
      
      setEditingId(null);
    } catch (err) {
      onAction && onAction(`<span style="color:#ea2e49">Transaction failed: ${err.message || String(err)}</span>`, "error");
    }
  };

  const handleCancel = (cronId, cron) => {
    // Ensure cronId is a valid number
    if (isNaN(Number(cronId))) {
      onAction && onAction(`<span style="color:#ea2e49">Invalid cron ID: Not a number</span>`, "error");
      return;
    }
    
    setCancelingId(cronId);
    if (onAction) onAction(`<span style="color:#2997ff">Submitting cancelCron for CronId: <b>${cronId}</b> ...</span>`, "info");
    
    try {
      // Ensure we're using a valid BigInt conversion
      const cronIdBigInt = BigInt(Number(cronId));
      
      setActionState({
        type: 'cancel',
        data: { cronId, contractAddress: cron.contractAddress },
        logSent: false
      });
      
      writeCancel({
        address: CHRONOS_ADDRESS,
        abi: CHRONOS_ABI,
        functionName: "cancelCron",
        args: [cronIdBigInt],
        gas: BigInt(300000) // Fixed gas to avoid estimation issues
      });
    } catch (err) {
      onAction && onAction(`<span style="color:#ea2e49">Transaction failed: ${err.message || String(err)}</span>`, "error");
      setCancelingId(null);
    }
  };

  const handleDeposit = (cronId, aliasAddr) => {
    if (onAction) onAction(`<span style="color:#2997ff">Preparing deposit to Cron Wallet <b>${formatAddr(aliasAddr)}</b> ...</span>`, "info");
  };
  
  const sendDeposit = (aliasAddr, depositValue, setDepositingId) => {
    if (!depositValue || parseFloat(depositValue) <= 0) return;
    
    if (onAction) onAction(`<span style="color:#2997ff">Submitting deposit of ${depositValue} HLS to <b>${formatAddr(aliasAddr)}</b> ...</span>`, "info");
    
    setActionState({
      type: 'deposit',
      data: { aliasAddress: aliasAddr, amount: depositValue },
      logSent: false
    });
    
    try {
      sendTransaction({
        to: aliasAddr,
        value: parseUnits(depositValue, 18),
        gas: BigInt(21000) // Standard gas for simple transfers
      });
    } catch (err) {
      onAction && onAction(`<span style="color:#ea2e49">Deposit failed: ${err.message || String(err)}</span>`, "error");
      setDepositingId(null);
    }
  };

  // Effect for resetting states after successful transactions
  useState(() => {
    if (isCancelTxSuccess) {
      setCancelingId(null);
    }
  }, [isCancelTxSuccess]);

  return {
    handleUpdate,
    handleCancel,
    handleDeposit,
    sendDeposit,
    cancelingId,
    updateStatus,
    cancelStatus,
    depositStatus
  };
}