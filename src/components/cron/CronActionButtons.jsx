import React from "react";

export default function CronActionButtons({
  cronId,
  isExpired,
  isLowBalance,
  onCancel,
  onDeposit,
  isCancelling,
  isAnyFormOpen
}) {
  const isInactive = false; // This would be determined by checking if cron was already cancelled
  
  return (
    <div className="cron-action-group">
      <button
        className="cron-action-btn cancel"
        onClick={onCancel}
        disabled={isCancelling || isAnyFormOpen || isInactive}
      >
        {isCancelling ? "Cancelling..." : "Cancel"}
      </button>
      
      <button
        className={`cron-action-btn deposit ${isLowBalance ? "low-balance" : ""}`}
        onClick={onDeposit}
        disabled={isAnyFormOpen || isInactive}
      >Deposit</button>
    </div>
  );
}