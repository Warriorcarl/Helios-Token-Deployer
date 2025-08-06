export const cronStyles = `
  .cron-list-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border-radius: 8px;
    border: 1px solid #eee;
    padding: 16px;
    margin-bottom: 16px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .cron-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
  }
  
  .cron-list-detail {
    margin-bottom: 6px;
    font-size: 14px;
  }
  
  .cron-details {
    width: 100%;
  }
  
  .cronid-label {
    font-weight: 600;
    color: #555;
  }
  
  .cronid-value {
    margin-left: 5px;
    color: #2997ff;
    font-weight: 700;
  }
  
  .expanded-details {
    margin-top: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid #2997ff;
  }
  
  .expanded-details h4 {
    margin-top: 0;
    margin-bottom: 8px;
    color: #2997ff;
  }
  
  .detail-row {
    display: flex;
    margin-bottom: 4px;
    font-size: 13px;
  }
  
  .detail-label {
    font-weight: 600;
    width: 120px;
    color: #555;
  }
  
  .toggle-details-btn {
    background: none;
    border: none;
    color: #2997ff;
    font-size: 13px;
    padding: 0;
    margin-top: 5px;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .warning-icon {
    font-size: 12px;
    margin-left: 5px;
  }
  
  .balance {
    color: #30b18a;
    font-weight: 700;
  }
  
  .balance.low-balance {
    color: #ff9900;
  }
  
  .cron-action-btn {
    padding: 12px 24px;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    min-width: 120px;
  }
  
  .cron-action-btn.cancel {
    background: #f1f1f1;
    color: #666;
  }
  
  .cron-action-btn.cancel:hover:not(:disabled) {
    background: #e0e0e0;
  }
  
  .cron-action-btn.deposit {
    background: #1dc185;
    color: white;
  }
  
  .cron-action-btn.deposit:hover:not(:disabled) {
    background: #17a76f;
  }
  
  .cron-action-btn.deposit.low-balance {
    background: #ff9900;
  }
  
  .cron-action-btn.deposit.low-balance:hover:not(:disabled) {
    background: #e68a00;
  }
  
  .cron-action-btn.save {
    background: #2997ff;
    color: white;
  }
  
  .cron-action-btn.cancel-edit,
  .cron-action-btn.cancel-deposit {
    background: #f1f1f1;
    color: #666;
  }
  
  .cron-action-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
  
  .cron-action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .cron-action-group {
    width: 100%;
    display: flex;
    gap: 16px;
    margin-top: 20px;
    justify-content: center;
  }
  
  .cron-edit-row,
  .cron-deposit-row {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
    align-items: center;
  }
  
  .input-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .input-group label {
    font-size: 14px;
    color: #2997ff;
    font-weight: 600;
  }
  
  .input-group input {
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 80px;
    text-align: center;
  }
  
  .hint {
    font-size: 13px;
    color: #888;
  }
  
  .current-block {
    font-size: 13px;
    color: #888;
  }
  
  .button-group {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }
  
  .cron-empty-msg {
    text-align: center;
    padding: 30px;
    background: #f8f9fa;
    border-radius: 8px;
    color: #666;
  }
  
  .cron-err-msg {
    background: #ffecec;
    color: #e74c3c;
  }
  
  @media (max-width: 768px) {
    .cron-edit-row,
    .cron-deposit-row,
    .cron-action-group,
    .input-group {
      flex-direction: column;
      align-items: stretch;
    }
    
    .button-group {
      margin-left: 0;
      width: 100%;
    }
    
    .cron-action-btn {
      width: 100%;
      min-width: auto;
    }
    
    .cron-action-group {
      gap: 12px;
    }
  }
`;