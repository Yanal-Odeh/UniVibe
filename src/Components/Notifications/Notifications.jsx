import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import styles from './Notifications.module.scss';

function Notifications() {
  const [open, setOpen] = useState(false);
  // placeholder notifications - will be populated later from API/context
  const [notifications] = useState([]);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  const toggle = () => setOpen(o => !o);

  // close when clicking outside
  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [open]);

  return (
    <div className={styles.container}>
      <button
        ref={btnRef}
        className={styles.bellButton}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        title="Notifications"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </button>

      {open && (
        <div ref={panelRef} className={styles.panel} role="dialog" aria-label="Notifications panel">
          <div className={styles.panelHeader}>
            <strong>Notifications</strong>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              <X size={14} />
            </button>
          </div>

          <div className={styles.panelBody}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications</div>
            ) : (
              <ul className={styles.list}>
                {notifications.map((n, i) => (
                  <li key={i} className={styles.item}>{n.message || 'Notification'}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
