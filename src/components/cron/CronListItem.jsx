import React from "react";
import CronDetailView from "./CronDetailView";
import CronDepositForm from "./CronDepositForm";
import CronActionButtons from "./CronActionButtons";
import { formatAddr, isCronExpired, hasLowBalance } from "../../utils/cronUtils";

export default function CronListItem({
  cron,
  balance,
  currentBlock,
  depositingId,
  depositValue,
  setDepositValue,
  onCloseDeposit,
  onCancel,
  onDeposit,
  onSendDeposit,
  isCancelling,
  isDepositing
}) {
  // Determine cron status
  const isExpired = isCronExpired(cron, currentBlock);
  const isLowBalance = hasLowBalance(balance);
  
  return (
    <div className="cron-list-item">
      <div className="cron-list-meta">
        <div className="cron-header">
          <span className="cronid-label">CronId:<span className="cronid-value">{cron.id}</span></span>
        </div>
        
        <CronDetailView 
          cron={cron} 
          balance={balance} 
          isExpired={isExpired} 
          isLowBalance={isLowBalance}
        />
      </div>
      
      {depositingId === cron.id ? (
        <CronDepositForm 
          depositValue={depositValue}
          setDepositValue={setDepositValue}
          onSubmit={() => onSendDeposit(cron.address)}
          onCancel={onCloseDeposit}
          isDepositing={isDepositing}
        />
      ) : (
        <CronActionButtons 
          cronId={cron.id}
          isExpired={isExpired}
          isLowBalance={isLowBalance}
          onCancel={() => onCancel(cron.id, cron)}
          onDeposit={onDeposit}
          isCancelling={isCancelling}
          isAnyFormOpen={depositingId !== null}
        />
      )}
    </div>
  );
}