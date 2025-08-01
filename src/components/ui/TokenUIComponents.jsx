import React from 'react';

// Token Deployer specific UI components
export const TokenUIElements = {
  // Diamond icon for token parameters
  DiamondIcon: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#2997ff" style={{marginRight: "7px"}}>
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
  ),

  // Paint icon for logo section
  PaintIcon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#2997ff">
      <circle cx="12" cy="12" r="9" stroke="#2997ff" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="4" fill="#2997ff"/>
    </svg>
  ),

  // File icon for upload
  FileIcon: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="6" fill="#D7E0FF"/>
      <path d="M10 10h12v2H10zm0 6h12v2H10z" fill="#002DCB"/>
    </svg>
  ),

  // Logo preview component
  LogoPreview: ({ src, alt = "Logo Preview" }) => (
    <img className="logo-preview" src={src} alt={alt} />
  ),

  // Progress bar for deployment
  ProgressBar: ({ progress }) => (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  ),

  // Status message component
  StatusMessage: ({ message, type }) => (
    <div className={`status ${type}`}>
      <span>{message}</span>
    </div>
  )
};

// Form components for token deployment
export const TokenFormElements = {
  // Token name input
  TokenNameInput: ({ value, onChange, placeholder = "Token Name (e.g. MyToken)" }) => (
    <input 
      type="text" 
      placeholder={placeholder}
      value={value} 
      onChange={onChange}
      className="token-input"
    />
  ),

  // Token symbol input with validation and auto-capitalization
  TokenSymbolInput: ({ value, onChange, maxLength = 5, placeholder = "Token Symbol (e.g. MYT)" }) => (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        // Auto-capitalize and pass to onChange
        const capitalizedValue = e.target.value.toUpperCase();
        const syntheticEvent = { ...e, target: { ...e.target, value: capitalizedValue } };
        onChange(syntheticEvent);
      }}
      maxLength={maxLength}
      className="token-input"
    />
  ),

  // Total supply input
  TotalSupplyInput: ({ value, onChange, placeholder = "Total Supply (e.g. 1000000)" }) => (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ MozAppearance: 'textfield' }}
      autoComplete="off"
      className="token-input"
    />
  ),

  // Logo option selector
  LogoSelector: ({ value, onChange, options }) => (
    <select value={value} onChange={onChange} className="logo-selector">
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),

  // Hidden file input for image upload
  HiddenFileInput: ({ id, onChange, accept = "image/*" }) => (
    <input 
      id={id}
      type="file" 
      accept={accept}
      style={{ display: "none" }} 
      onChange={onChange} 
    />
  )
};

// Button components for token deployer
export const TokenButtonElements = {
  // Generate logo button
  GenerateLogoButton: ({ onClick, disabled = false }) => (
    <button 
      type="button" 
      className="logo-generate-btn" 
      onClick={onClick}
      disabled={disabled}
    >
      <span>Generate</span>
      <span>Random Logo</span>
    </button>
  ),

  // Upload image button
  UploadImageButton: ({ onClick, disabled = false }) => (
    <button 
      type="button" 
      className="logo-generate-btn" 
      style={{ background: "#D7E0FF", color: "#002DCB" }}
      onClick={onClick}
      disabled={disabled}
    >
      <TokenUIElements.FileIcon />
      <span>Upload</span>
      <span>Image</span>
    </button>
  ),

  // Deploy token button
  DeployButton: ({ onClick, disabled = false, loading = false }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="deploy-button"
    >
      {loading ? 'Deploying...' : 'Deploy Token'}
    </button>
  )
};

// Layout components for token deployer
export const TokenLayoutElements = {
  // Main token card container
  TokenCard: ({ children }) => (
    <div className="token-card">
      {children}
    </div>
  ),

  // Card header
  CardHeader: ({ title, icon }) => (
    <div className="card-header">
      <span className="card-header-title">
        {icon && icon}
        {title}
      </span>
    </div>
  ),

  // Logo section container
  LogoSection: ({ children, title = "Token Logo" }) => (
    <div className="logo-section">
      <span className="logo-title">
        <TokenUIElements.PaintIcon /> {title}
      </span>
      {children}
    </div>
  ),

  // Logo actions container
  LogoActions: ({ children }) => (
    <div className="logo-actions">
      {children}
    </div>
  ),

  // Deploy actions container
  DeployActions: ({ children }) => (
    <div className="deploy-actions">
      {children}
    </div>
  ),

  // Console container for deployment logs
  ConsoleContainer: ({ children, title = "Deployment Console" }) => (
    <div className="details-container">
      <h3>{title}</h3>
      {children}
    </div>
  ),

  // Console log display with enhanced animations
  ConsoleLog: ({ logs, placeholder = "Awaiting deployment...", consoleEndRef }) => (
    <div className="console-log enhanced-console" style={{ minHeight: "180px" }}>
      {logs.length > 0 ? logs.map((log, idx) => (
        <div 
          key={idx} 
          className={`log-entry log-entry-animated ${log.type}`}
          style={{
            animation: `slideInFromRight 0.4s ease-out ${idx * 0.1}s both`,
            opacity: 0
          }}
        >
          <span className="log-timestamp">{log.timestamp}</span>
          <span 
            className={`log-message ${log.type}`} 
            dangerouslySetInnerHTML={{ __html: log.message }} 
          />
        </div>
      )) : (
        <div className="console-placeholder-enhanced">
          <div className="loading-spinner">
            <span className="spinner-emoji">⚙️</span>
          </div>
          <span className="placeholder-text">
            {placeholder}
          </span>
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      <div ref={consoleEndRef} />
    </div>
  )
};

// Logo option configurations
export const LOGO_OPTIONS = [
  { value: 'none', label: 'No logo' },
  { value: 'upload', label: 'Upload image' },
  { value: 'generate', label: 'Generate logo' }
];