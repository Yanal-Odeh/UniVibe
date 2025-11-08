import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import styles from './AdminSignIn.module.scss';

function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.adminSignInContainer}>
      <div className={styles.adminSignInCard}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapper}>
            <Shield size={48} />
          </div>
          <h1 className={styles.title}>Admin Access</h1>
          <p className={styles.subtitle}>Sign in to access the admin panel</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form className={styles.signInForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              <Mail size={16} />
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="admin@univibe.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div className={styles.infoSection}>
          <p className={styles.infoText}>
            <AlertCircle size={16} />
            This area is restricted to authorized administrators only
          </p>
        </div>

        {/* Development Helper - Remove in production */}
        <div className={styles.devHelper}>
          <p><strong>Test Accounts:</strong></p>
          <p>Admin 1: admin1@univibe.edu / admin123</p>
          <p>Admin 2: admin2@univibe.edu / admin456</p>
        </div>
      </div>
    </div>
  );
}

export default AdminSignIn;
