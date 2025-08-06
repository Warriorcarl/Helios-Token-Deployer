import React, { useState } from "react";
import { useAccount } from "wagmi";
import useCronData from "../hooks/useCronData";
import useCronOperations from "../hooks/useCronOperations";
import CronListItem from "./cron/CronListItem";
import { cronStyles } from "../styles/cronStyles";

// Import separated UI components
import { ListElements } from "./ui/CronUIComponents";

export default function MyCronsList({ onAction, blockNumber }) {
  const { address, isConnected } = useAccount();
  const [depositingId, setDepositingId] = useState(null);
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
    handleCancel, 
    handleDeposit, 
    sendDeposit,
    cancelingId, 
    cancelStatus, 
    depositStatus 
  } = useCronOperations(onAction, blockNumber, refreshData);
  
  const openDepositForm = (cronId, aliasAddr) => {
    setDepositingId(cronId);
    setDepositValue("");
    handleDeposit(cronId, aliasAddr);
  };
  
  // Render states using separated UI components
  if (!isConnected) return <ListElements.EmptyState message="Connect your wallet to see your cron jobs." />;
  if (loading) return <ListElements.LoadingState message="Loading your cron jobs..." />;
  if (error) return <ListElements.EmptyState message={error} type="error" />;
  if (!crons.length) return <ListElements.EmptyState message="No cron jobs found for this wallet." />;

  return (
    <div>
      <ListElements.ListWrapper>
        {crons.map((cron) => (
          <CronListItem 
            key={cron.id}
            cron={cron}
            balance={balances[cron.address]}
            currentBlock={blockNumber}
            depositingId={depositingId}
            depositValue={depositValue}
            setDepositValue={setDepositValue}
            onCloseDeposit={() => setDepositingId(null)}
            onCancel={(cronId) => handleCancel(cronId, cron)}
            onDeposit={() => openDepositForm(cron.id, cron.address)}
            onSendDeposit={(aliasAddr) => sendDeposit(aliasAddr, depositValue, setDepositingId)}
            isCancelling={cancelingId === cron.id || cancelStatus.isPending || cancelStatus.isLoading}
            isDepositing={depositStatus.isPending || depositStatus.isLoading}
          />
        ))}
      </ListElements.ListWrapper>
      <style>{cronStyles}</style>
    </div>
  );
}