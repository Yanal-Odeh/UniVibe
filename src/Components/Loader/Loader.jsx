import React from 'react';
import styles from './Loader.module.scss';

function Loader({ size = 'medium', text = '' }) {
  return (
    <div className={`${styles.loaderContainer} ${styles[size]}`}>
      <div className={styles.spinner}>
        <div className={styles.bounce1}></div>
        <div className={styles.bounce2}></div>
        <div className={styles.bounce3}></div>
      </div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );
}

export default Loader;
