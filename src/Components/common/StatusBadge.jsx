import React from 'react';
import { getStatusLabel, getStatusClass } from '../../utils/eventHelpers';
import styles from './StatusBadge.module.scss';

/**
 * Reusable status badge component
 */
const StatusBadge = ({ status, className = '' }) => {
  return (
    <span 
      className={`${styles.statusBadge} ${styles[getStatusClass(status)]} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
