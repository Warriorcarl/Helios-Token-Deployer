import React from 'react';

// UI Components for Cron interface
export const CronUIElements = {
  // Clock icon component
  ClockIcon: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#2997ff" style={{marginRight:"7px"}}>
      <circle cx="12" cy="12" r="10" stroke="#2997ff" strokeWidth="2" fill="none"/>
      <path d="M12 7v5l3 3" stroke="#2997ff" strokeWidth="2" fill="none"/>
    </svg>
  ),

  // Status indicator component
  StatusIndicator: ({ status, color }) => (
    <div style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      color: '#fff',
      backgroundColor: color
    }}>
      {status}
    </div>
  ),

  // Progress bar component
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

// Form input components
export const FormElements = {
  // Number input with validation
  NumberInput: ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    placeholder, 
    helperText,
    style = {} 
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: '#2997ff', fontWeight: 600 }}>{label}</div>
        {helperText && <div style={{ fontSize: '13px', color: '#888' }}>{helperText}</div>}
      </div>
      <input
        className="cron-input-box"
        type="number"
        min={min}
        max={max}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ width: 100, marginBottom: 0, textAlign: 'center', ...style }}
      />
    </div>
  ),

  // Text input component
  TextInput: ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    type = 'text',
    style = {} 
  }) => (
    <div>
      {label && <div style={{ color: '#2997ff', fontWeight: 600, marginBottom: '8px' }}>{label}</div>}
      <input
        className="cron-input-box"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={style}
      />
    </div>
  )
};

// Button components
export const ButtonElements = {
  // Primary action button
  PrimaryButton: ({ 
    children, 
    onClick, 
    disabled = false, 
    loading = false,
    style = {} 
  }) => (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className="cron-btn-main"
      style={style}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),

  // Secondary action button
  SecondaryButton: ({ 
    children, 
    onClick, 
    disabled = false,
    style = {} 
  }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="cron-btn-secondary"
      style={style}
    >
      {children}
    </button>
  ),

  // Tab button
  TabButton: ({ 
    children, 
    onClick, 
    active = false,
    style = {} 
  }) => (
    <button 
      className={active ? "cron-tab-btn selected" : "cron-tab-btn"}
      onClick={onClick}
      style={{ fontWeight: 700, ...style }}
    >
      {children}
    </button>
  )
};

// Layout components
export const LayoutElements = {
  // Card container
  Card: ({ children, className = "cron-main-card", style = {} }) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),

  // Header row
  HeaderRow: ({ title, icon, style = {} }) => (
    <div className="cron-header-row" style={style}>
      <span className="cron-header-title">
        {icon && icon}
        {title}
      </span>
    </div>
  ),

  // Tab navigation
  TabNavigation: ({ tabs, activeTab, onTabChange, style = {} }) => (
    <div className="cron-tab-row" style={{ marginBottom: '16px', ...style }}>
      {tabs.map(tab => (
        <ButtonElements.TabButton
          key={tab.key}
          active={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </ButtonElements.TabButton>
      ))}
    </div>
  ),

  // Content area
  ContentArea: ({ children, style = {} }) => (
    <div className="cron-content-inner" style={style}>
      {children}
    </div>
  ),

  // Info row for displaying key-value pairs
  InfoRow: ({ label, value, style = {} }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      ...style 
    }}>
      <div style={{ color: '#888', fontSize: '14px', fontWeight: 600 }}>{label}</div>
      <div style={{ color: '#2997ff', fontSize: '15px', fontWeight: 700 }}>{value}</div>
    </div>
  )
};

// Console/Log components with enhanced transaction animations
export const ConsoleElements = {
  // Console container
  ConsoleContainer: ({ children, title = "Console", style = {} }) => (
    <div className="details-container" style={style}>
      <h3 style={{
        fontFamily: "Panchang,sans-serif",
        fontSize: "2rem",
        fontWeight: 700,
        marginTop: 6,
        marginBottom: 18
      }}>
        {title}
      </h3>
      {children}
    </div>
  ),

  // Enhanced log display with transaction-specific animations
  LogDisplay: ({ logs, placeholder = "Awaiting action...", consoleEndRef, style = {} }) => (
    <div className="console-log enhanced-console" style={{ minHeight: "180px", ...style }}>
      {logs.length > 0 ? logs.map((log, idx) => {
        // Determine animation class based on message content
        let animationClass = 'log-entry-animated';
        
        if (log.message.includes('pending') || log.message.includes('confirm in wallet')) {
          animationClass += ' pending-transaction';
        } else if (log.message.includes('sent') || log.message.includes('waiting for confirmation')) {
          animationClass += ' processing-transaction';
        } else if (log.message.includes('Successfully') || log.message.includes('✔️')) {
          animationClass += ' success-transaction';
        } else if (log.message.includes('Failed') || log.message.includes('❌')) {
          animationClass += ' error-transaction';
        } else if (log.message.includes('Submitting') || log.message.includes('Preparing')) {
          animationClass += ' info-transaction';
        }

        return (
          <div 
            key={idx} 
            className={`log-entry ${animationClass} ${log.type}`}
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
        );
      }) : (
        <div className="console-placeholder-enhanced">
          <div className="loading-spinner">
            <span className="spinner-emoji">🚀</span>
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
  ),

  // Transaction status indicator with live animation
  TransactionStatus: ({ status, animated = true }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'pending':
          return { 
            emoji: '🔄', 
            text: 'Pending Confirmation', 
            class: 'status-pending',
            color: '#ffa500' 
          };
        case 'processing':
          return { 
            emoji: '⏳', 
            text: 'Processing Transaction', 
            class: 'status-processing',
            color: '#2997ff' 
          };
        case 'success':
          return { 
            emoji: '✔️', 
            text: 'Transaction Successful', 
            class: 'status-success',
            color: '#30b18a' 
          };
        case 'error':
          return { 
            emoji: '❌', 
            text: 'Transaction Failed', 
            class: 'status-error',
            color: '#ff5c5c' 
          };
        default:
          return { 
            emoji: '📝', 
            text: 'Ready', 
            class: 'status-ready',
            color: '#888' 
          };
      }
    };

    const config = getStatusConfig(status);
    
    return (
      <div className={`transaction-status ${config.class} ${animated ? 'animated' : ''}`}>
        <span className="status-emoji">{config.emoji}</span>
        <span className="status-text" style={{ color: config.color }}>
          {config.text}
        </span>
      </div>
    );
  },

  // Animated loading dots for specific messages
  LoadingDots: ({ message, type = 'default' }) => (
    <div className={`loading-message ${type}`}>
      <span>{message}</span>
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  ),

  // Footer links
  FooterLinks: ({ links }) => (
    <div style={{ marginTop: '18px', fontSize: '12px', color: 'var(--cron-tab-inactive)' }}>
      {links.map((link, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && ' | '}
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ marginLeft: idx > 0 ? '6px' : '0' }}
          >
            {link.text}
          </a>
        </React.Fragment>
      ))}
    </div>
  )
};

// List components
export const ListElements = {
  // Empty state
  EmptyState: ({ message, type = 'info' }) => (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px 20px',
      color: type === 'error' ? '#ea2e49' : '#888'
    }}>
      {message}
    </div>
  ),

  // Loading state
  LoadingState: ({ message = "Loading..." }) => (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px 20px',
      color: '#888'
    }}>
      <div style={{ marginBottom: '16px' }}>⏳</div>
      {message}
    </div>
  ),

  // List wrapper
  ListWrapper: ({ children, className = "cron-list-wrap" }) => (
    <div className={className}>
      {children}
    </div>
  )
};