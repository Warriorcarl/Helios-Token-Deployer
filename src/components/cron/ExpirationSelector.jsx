import React from "react";
import "./expiration-selector-styles.css";

// Convert hours/days to blocks (assuming 3 seconds per block)
const BLOCK_TIME_SECONDS = 3;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

const EXPIRATION_OPTIONS = [
  { 
    label: "6 hours", 
    value: "6h", 
    blocks: Math.floor((6 * SECONDS_PER_HOUR) / BLOCK_TIME_SECONDS) 
  },
  { 
    label: "12 hours", 
    value: "12h", 
    blocks: Math.floor((12 * SECONDS_PER_HOUR) / BLOCK_TIME_SECONDS) 
  },
  { 
    label: "18 hours", 
    value: "18h", 
    blocks: Math.floor((18 * SECONDS_PER_HOUR) / BLOCK_TIME_SECONDS) 
  },
  { 
    label: "1 day", 
    value: "1d", 
    blocks: Math.floor((1 * SECONDS_PER_DAY) / BLOCK_TIME_SECONDS) 
  }
];

/**
 * ExpirationSelector Component
 * Provides fixed time-based expiration options for cron jobs
 * Automatically calculates block values based on time intervals
 */
export default function ExpirationSelector({
  value,
  onChange,
  disabled = false,
  label = "Expiration Duration",
  currentBlock = 0
}) {
  // Find the current selection or default to first option
  const currentSelection = EXPIRATION_OPTIONS.find(opt => opt.blocks.toString() === value?.toString()) || EXPIRATION_OPTIONS[0];

  const handleSelectionChange = (e) => {
    const selectedOption = EXPIRATION_OPTIONS.find(opt => opt.blocks.toString() === e.target.value);
    if (selectedOption && onChange) {
      // Pass the block value to parent component
      onChange(selectedOption.blocks.toString());
    }
  };

  // Calculate expiration block number
  const expirationBlock = currentBlock + currentSelection.blocks;

  return (
    <div className="expiration-selector">
      <div className="input-group">
        <label className="expiration-label">{label}</label>
        <select
          value={currentSelection.blocks}
          onChange={handleSelectionChange}
          disabled={disabled}
          className="expiration-select"
        >
          {EXPIRATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.blocks}>
              {option.label} (~{option.blocks.toLocaleString()} blocks)
            </option>
          ))}
        </select>
        <div className="expiration-info">
          <div className="expiration-details">
            <small>
              Selected: {currentSelection.label} ({currentSelection.blocks.toLocaleString()} blocks)
            </small>
            {currentBlock > 0 && (
              <small className="expiration-block">
                Expires at block: {expirationBlock.toLocaleString()}
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export expiration options for use in other components
export { EXPIRATION_OPTIONS };