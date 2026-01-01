import React from 'react';
import { Check, MessageSquare, X } from 'lucide-react';
import styles from './ActionButtons.module.scss';

/**
 * Reusable action buttons for event approval workflow
 */
const ActionButtons = ({ 
  onApprove, 
  onDeny, 
  onReject,
  isProcessing, 
  showReject = false,
  approveText = "Approve Event",
  denyText = "Request Revision",
  rejectText = "Reject Event"
}) => {
  return (
    <div className={styles.actionButtons}>
      <button
        onClick={onApprove}
        disabled={isProcessing}
        className={`${styles.actionBtn} ${styles.approveBtn}`}
      >
        <Check size={16} />
        {approveText}
      </button>
      
      <button
        onClick={onDeny}
        disabled={isProcessing}
        className={`${styles.actionBtn} ${styles.revisionBtn}`}
      >
        <MessageSquare size={16} />
        {denyText}
      </button>
      
      {showReject && (
        <button
          onClick={onReject}
          disabled={isProcessing}
          className={`${styles.actionBtn} ${styles.rejectBtn}`}
        >
          <X size={16} />
          {rejectText}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
