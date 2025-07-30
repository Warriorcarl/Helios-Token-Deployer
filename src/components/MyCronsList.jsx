import React, { useState } from "react";
import { useAccount } from "wagmi";
import useCronData from "../hooks/useCronData";
import useCronOperations from "../hooks/useCronOperations";
import CronListItem from "./cron/CronListItem";
import EmptyState from "./cron/EmptyState";
import { cronStyles } from "../styles/cronStyles";

export default function MyCronsList({ onAction, blockNumber }) {
  const { address, isConnected } = useAccount();
  const [editingId, setEditingId] = useState(null);
  const [depositingId, setDepositingId] = useState(null);
  const [formVals, setFormVals] = useState({});
  const [depositValue, setDepositValue] = useState("");

  // Get cron data from custom hook
  const { 
    crons, 
    loading, 
    error, 
    balances, 
    refreshData 
  } = useCronData(address, isConnected);
  
  // Get operation functions from custom hook
  const { 
    handleUpdate, 
    handleCancel, 
    handleDeposit, 
    sendDeposit,
    cancelingId, 
    updateStatus, 
    cancelStatus, 
    depositStatus 
  } = useCronOperations(onAction, blockNumber, refreshData);
  
  // Handle form open/close
  const openEditForm = (cron) => {
    setEditingId(cron.id);
    setFormVals({
      newFrequency: cron.frequency,
      newExpiration: "",
      blockNow: blockNumber || 0,
      currentExp: cron.expirationBlock
    });
  };
  
  const openDepositForm = (cronId, aliasAddr) => {
    setDepositingId(cronId);
    setDepositValue("");
    handleDeposit(cronId, aliasAddr);
  };
  
  // Render states
  if (!isConnected) return <EmptyState message="Connect your wallet to see your cron jobs." />;
  if (loading) return <EmptyState message="Loading your cron jobs..." />;
  if (error) return <EmptyState message={error} type="error" />;
  if (!crons.length) return <EmptyState message="No cron jobs found for this wallet." />;

  return (
    <div>
      <div className="cron-list-wrap">
        {crons.map((cron) => (
          <CronListItem 
            key={cron.id}
            cron={cron}
            balance={balances[cron.address]}
            currentBlock={blockNumber}
            editingId={editingId}
            depositingId={depositingId}
            formVals={formVals}
            depositValue={depositValue}
            setFormVals={setFormVals}
            setDepositValue={setDepositValue}
            onEdit={() => openEditForm(cron)}
            onCloseEdit={() => setEditingId(null)}
            onDeposit={() => openDepositForm(cron.id, cron.address)}
            onCloseDeposit={() => setDepositingId(null)}
            onUpdate={(c) => handleUpdate(c, formVals, setEditingId)}
            onCancel={(cronId) => handleCancel(cronId, cron)}
            onSendDeposit={(aliasAddr) => sendDeposit(aliasAddr, depositValue, setDepositingId)}
            isUpdating={updateStatus.isPending || updateStatus.isLoading}
            isCancelling={cancelingId === cron.id || cancelStatus.isPending || cancelStatus.isLoading}
            isDepositing={depositStatus.isPending || depositStatus.isLoading}
          />
        ))}
      </div>
      <style>{cronStyles}</style>
    </div>
  );
}