import React from 'react';
import { MessageSquare } from 'lucide-react';
import styles from './RevisionSection.module.scss';

/**
 * Reusable revision request section component
 */
const RevisionSection = ({ 
  revisionMessage, 
  previousResponse,
  responseValue,
  onResponseChange,
  onSubmit,
  isSubmitting,
  placeholder = "Write your response...",
  submitButtonText = "Submit Response",
  title = "Revision Request"
}) => {
  return (
    <div className={styles.revisionSection}>
      <div className={styles.revisionHeader}>
        <MessageSquare size={18} />
        <h4>{title}</h4>
      </div>
      
      <div className={styles.revisionMessage}>
        {revisionMessage}
      </div>
      
      {previousResponse && (
        <div className={styles.previousResponse}>
          <strong>Your Previous Response:</strong>
          <p>{previousResponse}</p>
        </div>
      )}
      
      <div className={styles.revisionResponseForm}>
        <textarea
          value={responseValue}
          onChange={onResponseChange}
          placeholder={placeholder}
          rows={4}
          className={styles.revisionTextarea}
        />
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={styles.submitRevisionBtn}
        >
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </div>
  );
};

export default RevisionSection;
