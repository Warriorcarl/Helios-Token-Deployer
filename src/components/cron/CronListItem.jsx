import React from "react";
import CronDetailView from "./CronDetailView";
import CronEditForm from "./CronEditForm";
import CronDepositForm from "./CronDepositForm";
import CronActionButtons from "./CronActionButtons";
import { formatAddr, isCronExpired, hasLowBalance } from "../../utils/cronUtils";

const EXPLORER_URL = "https://explorer.helioschainlabs.org";

export default function CronListItem({
  cron,
  balance,
  currentBlock,
  editingId,
  depositingId,
  formVals,
  depositValue,
  setFormVals,
  setDepositValue,
  onEdit,
  onCloseEdit,
  onDeposit,
  onCloseDeposit,
  onUpdate,
  onCancel,
  onSendDeposit,
  isUpdating,
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
      
      <a
        className="cron-action-btn view"
        href={`${EXPLORER_URL}/address/${cron.address}?tab=crons`}
        target="_blank"
        rel="noopener noreferrer"
      >View</a>
      
      {editingId === cron.id ? (
        <CronEditForm 
          cron={cron}
          formVals={formVals}
          setFormVals={setFormVals}
          onSubmit={() => onUpdate(cron)}
          onCancel={onCloseEdit}
          isUpdating={isUpdating}
          currentBlock={currentBlock}
        />
      ) : depositingId === cron.id ? (
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
          onEdit={onEdit}
          onCancel={() => onCancel(cron.id, cron)}
          onDeposit={onDeposit}
          isCancelling={isCancelling}
          isAnyFormOpen={editingId !== null || depositingId !== null}
        />
      )}
    </div>
  );
}