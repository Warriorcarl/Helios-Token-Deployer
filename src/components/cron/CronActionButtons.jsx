import React from "react";

export default function CronActionButtons({
  cronId,
  isExpired,
  isLowBalance,
  onCancel,
  isCancelling,
  isAnyFormOpen
}) {
  const isInactive = false; // This would be determined by checking if cron was already cancelled
  
  return (
    <div className="cron-action-group">
      <button
        className="cron-action-btn cancel full-width"
        onClick={onCancel}
        disabled={isCancelling || isAnyFormOpen || isInactive}
      >
        {isCancelling ? "Cancelling..." : "Cancel"}
      </button>
    </div>
  );
}