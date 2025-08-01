import React from "react";

export default function CronDepositForm({
  depositValue,
  setDepositValue,
  onSubmit,
  onCancel,
  isDepositing
}) {
  return (
    <div className="cron-deposit-row">
      <input
        type="number"
        min="0"
        value={depositValue}
        onChange={e => setDepositValue(e.target.value)}
        placeholder="Amount HLS"
      />
      
      <button
        className="cron-action-btn deposit"
        onClick={onSubmit}
        disabled={isDepositing || !depositValue}
      >Send</button>
      
      <button
        className="cron-action-btn cancel-deposit"
        onClick={onCancel}
      >Cancel</button>
    </div>
  );
}