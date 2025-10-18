import React from 'react'
import { Link,NavLink } from 'react-router-dom'
import styles from './NotFound.module.scss'


function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.glitch} data-text="404">404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Oops! The page you're looking for seems to have wandered off into the digital void.
        </p>
        <div className={styles.buttonGroup}>
          <Link to="/" className={styles.homeButton}>
            <span>Take Me Home</span>
          </Link>
        </div>
        
        <div className={styles.astronaut}>
          <div className={styles.astronautBody}>
            <div className={styles.helmet}></div>
            <div className={styles.body}></div>
            <div className={styles.armLeft}></div>
            <div className={styles.armRight}></div>
            <div className={styles.legLeft}></div>
            <div className={styles.legRight}></div>
          </div>
        </div>
        
        <div className={styles.stars}>
          {[...Array(50)].map((_, i) => (
            <div key={i} className={styles.star}></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotFound