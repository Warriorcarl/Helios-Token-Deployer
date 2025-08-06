import React from "react";
import { useAccount } from 'wagmi';

export default function CronActionButtons({
  cronId,
  isExpired,
  isLowBalance,
  onCancel,
  isCancelling,
  isAnyFormOpen
}) {
  const { isConnected } = useAccount();
  const isInactive = false; // This would be determined by checking if cron was already cancelled
  
  return (
    <div className="cron-action-group">
      <button
        className="cron-action-btn cancel full-width"
        onClick={onCancel}
        disabled={isCancelling || isAnyFormOpen || isInactive || !isConnected}
      >
        {!isConnected ? "Connect Wallet" : (isCancelling ? "Cancelling..." : "Cancel")}
      </button>
    </div>
  );
}