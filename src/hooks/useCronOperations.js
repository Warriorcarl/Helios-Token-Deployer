import { useState, useEffect } from "react";
import { useContractWrite, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import { CHRONOS_ADDRESS, CHRONOS_ABI } from "../constants/abi";
import { CronUpdateManager, DepositManager, URLUtils } from "../logic";
import { TransactionDebugger } from "../debug/debugUtils";
import { formatAddr, extractRevertReason } from "../utils/cronUtils";

export default function useCronOperations(onAction, blockNumber, refreshData) {
  const [cancelingId, setCancelingId] = useState(null);
  const [actionState, setActionState] = useState({
    type: null,
    data: null,
    logSent: false
  });

  // Initialize update manager with current block
  const updateManager = new CronUpdateManager(blockNumber);

  // Update block number in manager when it changes
  useEffect(() => {
    updateManager.updateBlockNumber(blockNumber);
  }, [blockNumber, updateManager]);

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
  const { isLoading: isUpdateTxLoading, isSuccess: isUpdateTxSuccess, isError: isUpdateTxError, error: updateTxError } = 
    useWaitForTransactionReceipt({ hash: updateTxHash });
  const { isLoading: isCancelTxLoading, isSuccess: isCancelTxSuccess, isError: isCancelTxError, error: cancelTxError } = 
    useWaitForTransactionReceipt({ hash: cancelTxHash });
  const { isLoading: isDepositTxLoading, isSuccess: isDepositTxSuccess, isError: isDepositTxError, error: depositTxError } = 
    useWaitForTransactionReceipt({ hash: depositTxHash });

  // Status tracking objects
  const updateStatus = {
    isPending: isUpdatePending,
    isLoading: isUpdateTxLoading,
    isSuccess: isUpdateTxSuccess,
    error: updateError,
    txHash: updateTxHash
  };

  const cancelStatus = {
    isPending: isCancelPending,
    isLoading: isCancelTxLoading,
    isSuccess: isCancelTxSuccess,
    error: cancelError,
    txHash: cancelTxHash
  };

  const depositStatus = {
    isPending: isDepositPending,
    isLoading: isDepositTxLoading,
    isSuccess: isDepositTxSuccess,
    error: depositError,
    txHash: depositTxHash
  };

  // Handle transaction logging with debugging and enhanced animations
  const handleTransactionLogging = () => {
    if (!actionState.type) return;
    
    // UPDATE transaction
    if (actionState.type === 'update') {
      if (isUpdatePending && !actionState.logSent) {
        onAction && onAction("🔄 Update transaction pending - confirm in wallet...", "pending");
        setActionState(prev => ({ ...prev, logSent: true }));
      }
      
      if (isUpdateTxLoading && actionState.logSent) {
        onAction && onAction("⏳ Update transaction sent - waiting for confirmation...", "processing");
      }
      
      if (isUpdateTxSuccess && updateTxHash) {
        TransactionDebugger.logTransactionSuccess('UPDATE_CRON', updateTxHash, null);
        
        const contractLink = URLUtils.formatAddressLink(actionState.data.contractAddress, formatAddr(actionState.data.contractAddress));
        const txLink = URLUtils.formatTransactionLink(updateTxHash);
        
        onAction && onAction(
          `<b>✔️ Cron Updated Successfully!</b><br/>
          CronId: ${actionState.data.cronId}<br/>
          Frequency: ${actionState.data.frequency}<br/>
          Expiration Block: ${actionState.data.expirationBlock}<br/>
          Target: ${contractLink}<br/>
          ${txLink}`,
          "success"
        );
        setActionState({ type: null, data: null, logSent: false });
        refreshData();
      }
      
      if (isUpdateTxError || updateTxError) {
        TransactionDebugger.logTransactionError('UPDATE_CRON', updateTxError);
        let errorMsg = updateTxError?.shortMessage || updateTxError?.message || 'Transaction failed on blockchain';
        onAction && onAction(`❌ Update Transaction Failed: ${errorMsg}`, "error");
        setActionState({ type: null, data: null, logSent: false });
      }
      
      if (updateError) {
        TransactionDebugger.logTransactionError('UPDATE_CRON', updateError);
        let errorMsg = updateError.shortMessage || updateError.message || String(updateError);
        if (errorMsg.includes("doesn't exists") || errorMsg.includes("invalid cron")) {
          errorMsg = "Cron job doesn't exist or you're not the owner";
        } else if (errorMsg.includes("user rejected") || errorMsg.includes("User denied")) {
          errorMsg = "Transaction cancelled by user";
        } else if (errorMsg.includes("missing or invalid parameters")) {
          errorMsg = "Missing or invalid parameters.\nDouble check you have provided the correct parameters.";
        }
        onAction && onAction(`❌ Update Transaction Failed: ${errorMsg}`, "error");
        setActionState({ type: null, data: null, logSent: false });
      }
    }
    
    // CANCEL transaction
    if (actionState.type === 'cancel') {
      if (isCancelPending && !actionState.logSent) {
        onAction && onAction("🔄 Cancel transaction pending - confirm in wallet...", "pending");
        setActionState(prev => ({ ...prev, logSent: true }));
      }
      
      if (isCancelTxLoading && actionState.logSent) {
        onAction && onAction("⏳ Cancel transaction sent - waiting for confirmation...", "processing");
      }
      
      if (isCancelTxSuccess && cancelTxHash) {
        TransactionDebugger.logTransactionSuccess('CANCEL_CRON', cancelTxHash, null);
        
        const contractLink = URLUtils.formatAddressLink(actionState.data.contractAddress, formatAddr(actionState.data.contractAddress));
        const txLink = URLUtils.formatTransactionLink(cancelTxHash);
        
        onAction && onAction(
          `<b>✔️ Cron Cancelled Successfully!</b><br/>
          CronId: ${actionState.data.cronId}<br/>
          Target: ${contractLink}<br/>
          ${txLink}`,
          "success"
        );
        setActionState({ type: null, data: null, logSent: false });
        setCancelingId(null);
        refreshData();
      }
      
      if (cancelError) {
        TransactionDebugger.logTransactionError('CANCEL_CRON', cancelError);
        let errorMsg = cancelError.shortMessage || cancelError.message || String(cancelError);
        if (errorMsg.includes("doesn't exists") || errorMsg.includes("invalid cron")) {
          errorMsg = "Cron job doesn't exist or you're not the owner";
        } else if (errorMsg.includes("user rejected") || errorMsg.includes("User denied")) {
          errorMsg = "Transaction cancelled by user";
        }
        onAction && onAction(`❌ Cancel Transaction Failed: ${errorMsg}`, "error");
        setActionState({ type: null, data: null, logSent: false });
        setCancelingId(null);
      }
    }
    
    // DEPOSIT transaction
    if (actionState.type === 'deposit') {
      if (isDepositPending && !actionState.logSent) {
        onAction && onAction("🔄 Deposit transaction pending - confirm in wallet...", "pending");
        setActionState(prev => ({ ...prev, logSent: true }));
      }
      
      if (isDepositTxLoading && actionState.logSent) {
        onAction && onAction("⏳ Deposit transaction sent - waiting for confirmation...", "processing");
      }
      
      if (isDepositTxSuccess && depositTxHash) {
        TransactionDebugger.logTransactionSuccess('DEPOSIT', depositTxHash, null);
        
        const txLink = URLUtils.formatTransactionLink(depositTxHash);
        
        onAction && onAction(
          `<b>✔️ Deposit Successful!</b><br/>
          Cron Wallet: ${formatAddr(actionState.data.aliasAddress)}<br/>
          Amount: ${actionState.data.amount} HLS<br/>
          ${txLink}`,
          "success"
        );
        setActionState({ type: null, data: null, logSent: false });
        refreshData();
      }
      
      if (depositError) {
        TransactionDebugger.logTransactionError('DEPOSIT', depositError);
        let errorMsg = extractRevertReason(depositError);
        if (errorMsg.includes("user rejected") || errorMsg.includes("User denied")) {
          errorMsg = "Transaction cancelled by user";
        }
        onAction && onAction(`❌ Deposit Transaction Failed: ${errorMsg}`, "error");
        setActionState({ type: null, data: null, logSent: false });
      }
    }
  };

  // Effect to handle transaction logging
  useEffect(() => {
    handleTransactionLogging();
  }, [
    actionState,
    isUpdatePending, isUpdateTxLoading, isUpdateTxSuccess, isUpdateTxError, updateTxHash, updateError, updateTxError,
    isCancelPending, isCancelTxLoading, isCancelTxSuccess, isCancelTxError, cancelTxHash, cancelError, cancelTxError,
    isDepositPending, isDepositTxLoading, isDepositTxSuccess, isDepositTxError, depositTxHash, depositError, depositTxError
  ]);

  // Update operation using separated logic
  const handleUpdate = (cron, formVals, setEditingId) => {
    try {
      TransactionDebugger.logTransactionStart('UPDATE_CRON', { cronId: cron.id, formVals });
      
      const args = updateManager.prepareUpdateArgs(
        cron.id, 
        formVals.newFrequency, 
        formVals.newExpiration,
        cron.gasLimit
      );
      
      if (onAction) onAction(`<span style="color:#2997ff">Submitting updateCron for CronId: <b>${cron.id}</b> ...</span>`, "info");
      
      setActionState({
        type: 'update',
        data: { 
          cronId: cron.id, 
          frequency: parseInt(formVals.newFrequency), 
          expirationBlock: blockNumber + parseInt(formVals.newExpiration),
          contractAddress: cron.contractAddress
        },
        logSent: false
      });
      
      writeUpdate({
        address: CHRONOS_ADDRESS,
        abi: CHRONOS_ABI,
        functionName: "updateCron",
        args: args,
        gas: BigInt(500000)
      });
      
      setEditingId(null);
    } catch (err) {
      TransactionDebugger.logTransactionError('UPDATE_CRON', err);
      onAction && onAction(`<span style="color:#ea2e49">Validation failed: ${err.message || String(err)}</span>`, "error");
    }
  };

  // Cancel operation using separated logic
  const handleCancel = (cronId, cron) => {
    try {
      // Validate cron ID using update manager validation
      const validation = updateManager.validateCronId(cronId);
      if (validation === null) {
        onAction && onAction(`<span style="color:#ea2e49">Invalid cron ID: Not a number</span>`, "error");
        return;
      }
      
      TransactionDebugger.logTransactionStart('CANCEL_CRON', { cronId });
      
      setCancelingId(cronId);
      if (onAction) onAction(`<span style="color:#2997ff">Submitting cancelCron for CronId: <b>${cronId}</b> ...</span>`, "info");
      
      setActionState({
        type: 'cancel',
        data: { cronId, contractAddress: cron.contractAddress },
        logSent: false
      });
      
      writeCancel({
        address: CHRONOS_ADDRESS,
        abi: CHRONOS_ABI,
        functionName: "cancelCron",
        args: [BigInt(validation)],
        gas: BigInt(300000)
      });
    } catch (err) {
      TransactionDebugger.logTransactionError('CANCEL_CRON', err);
      onAction && onAction(`<span style="color:#ea2e49">Transaction failed: ${err.message || String(err)}</span>`, "error");
      setCancelingId(null);
    }
  };

  // Deposit preparation using separated logic
  const handleDeposit = (cronId, aliasAddr) => {
    if (onAction) onAction(`<span style="color:#2997ff">Preparing deposit to Cron Wallet <b>${formatAddr(aliasAddr)}</b> ...</span>`, "info");
  };
  
  // Send deposit using separated logic
  const sendDeposit = (aliasAddr, depositValue, setDepositingId) => {
    try {
      const txData = DepositManager.prepareDepositTransaction(aliasAddr, depositValue);
      
      TransactionDebugger.logTransactionStart('DEPOSIT', { aliasAddr, amount: depositValue });
      
      if (onAction) onAction(`<span style="color:#2997ff">Submitting deposit of ${depositValue} HLS to <b>${formatAddr(aliasAddr)}</b> ...</span>`, "info");
      
      setActionState({
        type: 'deposit',
        data: { aliasAddress: aliasAddr, amount: depositValue },
        logSent: false
      });
      
      sendTransaction(txData);
    } catch (err) {
      TransactionDebugger.logTransactionError('DEPOSIT', err);
      onAction && onAction(`<span style="color:#ea2e49">Deposit failed: ${err.message || String(err)}</span>`, "error");
      setDepositingId && setDepositingId(null);
    }
  };

  // Effect for resetting states after successful transactions
  useEffect(() => {
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