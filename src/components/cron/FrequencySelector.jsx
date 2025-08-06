import React from "react";
import "./frequency-selector-styles.css";

// Convert minutes to blocks (assuming 15 seconds per block - 10-20 range average)
const BLOCK_TIME_SECONDS = 15;
const SECONDS_PER_MINUTE = 60;

const FREQUENCY_OPTIONS = [
  { label: "15 minutes", value: 15, blocks: Math.floor((15 * SECONDS_PER_MINUTE) / BLOCK_TIME_SECONDS) },
  { label: "30 minutes", value: 30, blocks: Math.floor((30 * SECONDS_PER_MINUTE) / BLOCK_TIME_SECONDS) },
  { label: "45 minutes", value: 45, blocks: Math.floor((45 * SECONDS_PER_MINUTE) / BLOCK_TIME_SECONDS) },
  { label: "60 minutes", value: 60, blocks: Math.floor((60 * SECONDS_PER_MINUTE) / BLOCK_TIME_SECONDS) }
];

/**
 * FrequencySelector Component
 * Provides fixed time-based frequency options for cron jobs
 * Automatically calculates block values based on time intervals
 */
export default function FrequencySelector({
  value,
  onChange,
  disabled = false,
  label = "Execution Frequency"
}) {
  // Find the current selection or default to first option
  const currentSelection = FREQUENCY_OPTIONS.find(opt => opt.blocks.toString() === value?.toString()) || FREQUENCY_OPTIONS[0];

  const handleSelectionChange = (e) => {
    const selectedOption = FREQUENCY_OPTIONS.find(opt => opt.blocks.toString() === e.target.value);
    if (selectedOption && onChange) {
      // Pass the block value to parent component
      onChange(selectedOption.blocks.toString());
    }
  };

  return (
    <div className="frequency-selector">
      <div className="input-group">
        <label className="frequency-label">{label}</label>
        <select
          value={currentSelection.blocks}
          onChange={handleSelectionChange}
          disabled={disabled}
          className="frequency-select"
        >
          {FREQUENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.blocks}>
              {option.label} (~{option.blocks} blocks)
            </option>
          ))}
        </select>
        <div className="frequency-info">
          <small>
            Selected: Every {currentSelection.label} ({currentSelection.blocks} blocks)
          </small>
        </div>
      </div>
    </div>
  );
}

// Export frequency options for use in other components
export { FREQUENCY_OPTIONS };