import React from 'react';
import styles from './LoadingSkeleton.module.scss';

/**
 * Event card loading skeleton
 */
export const EventCardSkeleton = () => (
  <div className={styles.eventCardSkeleton}>
    <div className={`${styles.skeleton} ${styles.image}`} />
    <div className={styles.content}>
      <div className={`${styles.skeleton} ${styles.title}`} />
      <div className={`${styles.skeleton} ${styles.text}`} />
      <div className={`${styles.skeleton} ${styles.text} ${styles.short}`} />
      <div className={styles.footer}>
        <div className={`${styles.skeleton} ${styles.badge}`} />
        <div className={`${styles.skeleton} ${styles.badge}`} />
      </div>
    </div>
  </div>
);

/**
 * List of event cards skeleton
 */
export const EventListSkeleton = ({ count = 6 }) => (
  <div className={styles.eventListSkeleton}>
    {Array.from({ length: count }).map((_, index) => (
      <EventCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Notification item skeleton
 */
export const NotificationSkeleton = () => (
  <div className={styles.notificationSkeleton}>
    <div className={`${styles.skeleton} ${styles.title}`} />
    <div className={`${styles.skeleton} ${styles.text}`} />
    <div className={styles.actions}>
      <div className={`${styles.skeleton} ${styles.button}`} />
      <div className={`${styles.skeleton} ${styles.button}`} />
    </div>
  </div>
);

/**
 * Table row skeleton
 */
export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className={styles.tableRowSkeleton}>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index}>
        <div className={`${styles.skeleton} ${styles.text}`} />
      </td>
    ))}
  </tr>
);

/**
 * Generic skeleton component
 */
export const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '' 
}) => (
  <div 
    className={`${styles.skeleton} ${className}`}
    style={{ width, height, borderRadius }}
  />
);

/**
 * Page loading skeleton
 */
export const PageSkeleton = () => (
  <div className={styles.pageSkeleton}>
    <div className={`${styles.skeleton} ${styles.pageTitle}`} />
    <div className={`${styles.skeleton} ${styles.pageSubtitle}`} />
    <div className={styles.pageContent}>
      <EventListSkeleton count={6} />
    </div>
  </div>
);

export default {
  EventCardSkeleton,
  EventListSkeleton,
  NotificationSkeleton,
  TableRowSkeleton,
  Skeleton,
  PageSkeleton
};
