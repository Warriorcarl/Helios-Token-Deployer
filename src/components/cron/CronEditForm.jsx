import React from "react";

export default function CronEditForm({
  formVals,
  setFormVals,
  onSubmit,
  onCancel,
  isUpdating,
  currentBlock
}) {
  return (
    <div className="cron-edit-row">
      <div className="input-group">
        <label>Frequency</label>
        <input
          type="number"
          min="1"
          max="10"
          value={formVals.newFrequency}
          onChange={e => setFormVals(v => ({ ...v, newFrequency: e.target.value }))}
        />
        <span className="hint">1-10</span>
      </div>
      
      <div className="input-group">
        <label>Expiration Block</label>
        <input
          type="number"
          min="1"
          max="10000"
          value={formVals.newExpiration}
          onChange={e => setFormVals(v => ({ ...v, newExpiration: e.target.value }))}
        />
        <span className="hint">+ Block (1-10000)</span>
      </div>
      
      <span className="current-block">Current Block: <b>{currentBlock || "-"}</b></span>
      
      <div className="button-group">
        <button
          className="cron-action-btn save"
          onClick={onSubmit}
          disabled={
            isUpdating ||
            parseInt(formVals.newFrequency) < 1 || 
            parseInt(formVals.newFrequency) > 10 ||
            parseInt(formVals.newExpiration) < 1 || 
            parseInt(formVals.newExpiration) > 10000
          }
        >Save</button>
        
        <button
          className="cron-action-btn cancel-edit"
          onClick={onCancel}
        >Cancel</button>
      </div>
    </div>
  );
}