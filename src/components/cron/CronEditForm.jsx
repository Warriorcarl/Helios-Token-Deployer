import React, { useState, useEffect } from "react";
import FrequencySelector, { FREQUENCY_OPTIONS } from "./FrequencySelector";
import ExpirationSelector, { EXPIRATION_OPTIONS } from "./ExpirationSelector";

export default function CronEditForm({
  formVals,
  setFormVals,
  onSubmit,
  onCancel,
  isUpdating,
  currentBlock
}) {
  // Find current frequency selection from block value
  const getCurrentFrequencySelection = () => {
    const currentFreq = parseInt(formVals.newFrequency);
    const match = FREQUENCY_OPTIONS.find(opt => opt.blocks === currentFreq);
    return match ? match.blocks.toString() : FREQUENCY_OPTIONS[0].blocks.toString();
  };

  // Find current expiration selection from offset value
  const getCurrentExpirationSelection = () => {
    const currentExp = parseInt(formVals.newExpiration);
    const match = EXPIRATION_OPTIONS.find(opt => opt.blocks === currentExp);
    return match ? match.blocks.toString() : EXPIRATION_OPTIONS[0].blocks.toString();
  };

  const [selectedFrequency, setSelectedFrequency] = useState(getCurrentFrequencySelection());
  const [selectedExpiration, setSelectedExpiration] = useState(getCurrentExpirationSelection());

  // Update formVals when dropdown selections change
  useEffect(() => {
    setFormVals(v => ({ 
      ...v, 
      newFrequency: selectedFrequency,
      newExpiration: selectedExpiration
    }));
  }, [selectedFrequency, selectedExpiration, setFormVals]);

  const isFormValid = () => {
    const freq = parseInt(selectedFrequency);
    const exp = parseInt(selectedExpiration);
    return freq > 0 && exp > 0;
  };

  return (
    <div className="cron-edit-row">
      <div className="edit-form-container">
        <h4>Edit Cron Job Settings</h4>
        
        <div className="edit-selectors">
          {/* Frequency Selector */}
          <FrequencySelector
            value={selectedFrequency}
            onChange={setSelectedFrequency}
            disabled={isUpdating}
            label="New Execution Frequency"
          />

          {/* Expiration Selector */}
          <ExpirationSelector
            value={selectedExpiration}
            onChange={setSelectedExpiration}
            disabled={isUpdating}
            label="New Job Duration"
            currentBlock={currentBlock}
          />
        </div>

        <div className="edit-info">
          <div className="info-row">
            <span className="info-label">Current Block:</span>
            <span className="info-value">{currentBlock?.toLocaleString() || "-"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">New Expiration Block:</span>
            <span className="info-value">{((currentBlock || 0) + parseInt(selectedExpiration))?.toLocaleString() || "-"}</span>
          </div>
        </div>
        
        <div className="button-group">
          <button
            className="cron-action-btn save"
            onClick={onSubmit}
            disabled={isUpdating || !isFormValid()}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            className="cron-action-btn cancel-edit"
            onClick={onCancel}
            disabled={isUpdating}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}