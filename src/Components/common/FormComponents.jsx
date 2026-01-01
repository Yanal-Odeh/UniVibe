import React from 'react';
import styles from './FormComponents.module.scss';

/**
 * Reusable Input Field Component
 */
export const Input = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  onBlur,
  error, 
  touched,
  required = false,
  placeholder = '',
  disabled = false,
  className = ''
}) => (
  <div className={`${styles.formGroup} ${className}`}>
    {label && (
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
    )}
    <input
      id={name}
      name={name}
      type={type}
      value={value || ''}
      onChange={(e) => onChange(name, e.target.value)}
      onBlur={() => onBlur && onBlur(name)}
      placeholder={placeholder}
      disabled={disabled}
      className={`${styles.input} ${touched && error ? styles.error : ''}`}
      aria-invalid={touched && error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {touched && error && (
      <span id={`${name}-error`} className={styles.errorMessage}>
        {error}
      </span>
    )}
  </div>
);

/**
 * Reusable Textarea Component
 */
export const Textarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur,
  error, 
  touched,
  required = false,
  placeholder = '',
  rows = 4,
  disabled = false,
  className = ''
}) => (
  <div className={`${styles.formGroup} ${className}`}>
    {label && (
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
    )}
    <textarea
      id={name}
      name={name}
      value={value || ''}
      onChange={(e) => onChange(name, e.target.value)}
      onBlur={() => onBlur && onBlur(name)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`${styles.textarea} ${touched && error ? styles.error : ''}`}
      aria-invalid={touched && error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {touched && error && (
      <span id={`${name}-error`} className={styles.errorMessage}>
        {error}
      </span>
    )}
  </div>
);

/**
 * Reusable Select Component
 */
export const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur,
  error, 
  touched,
  required = false,
  options = [],
  disabled = false,
  placeholder = 'Select an option',
  className = ''
}) => (
  <div className={`${styles.formGroup} ${className}`}>
    {label && (
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value || ''}
      onChange={(e) => onChange(name, e.target.value)}
      onBlur={() => onBlur && onBlur(name)}
      disabled={disabled}
      className={`${styles.select} ${touched && error ? styles.error : ''}`}
      aria-invalid={touched && error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {touched && error && (
      <span id={`${name}-error`} className={styles.errorMessage}>
        {error}
      </span>
    )}
  </div>
);

/**
 * Reusable Checkbox Component
 */
export const Checkbox = ({ 
  label, 
  name, 
  checked, 
  onChange,
  error,
  disabled = false,
  className = ''
}) => (
  <div className={`${styles.checkboxGroup} ${className}`}>
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        name={name}
        checked={checked || false}
        onChange={(e) => onChange(name, e.target.checked)}
        disabled={disabled}
        className={styles.checkbox}
      />
      <span>{label}</span>
    </label>
    {error && (
      <span className={styles.errorMessage}>{error}</span>
    )}
  </div>
);

/**
 * Reusable Radio Group Component
 */
export const RadioGroup = ({ 
  label, 
  name, 
  value, 
  onChange,
  options = [],
  error,
  touched,
  required = false,
  disabled = false,
  className = ''
}) => (
  <div className={`${styles.formGroup} ${className}`}>
    {label && (
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
    )}
    <div className={styles.radioGroup}>
      {options.map((option) => (
        <label key={option.value} className={styles.radioLabel}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(name, e.target.value)}
            disabled={disabled}
            className={styles.radio}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
    {touched && error && (
      <span className={styles.errorMessage}>{error}</span>
    )}
  </div>
);

/**
 * Date Input Component
 */
export const DateInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur,
  error, 
  touched,
  required = false,
  min,
  max,
  disabled = false,
  className = ''
}) => (
  <div className={`${styles.formGroup} ${className}`}>
    {label && (
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
    )}
    <input
      id={name}
      name={name}
      type="datetime-local"
      value={value || ''}
      onChange={(e) => onChange(name, e.target.value)}
      onBlur={() => onBlur && onBlur(name)}
      min={min}
      max={max}
      disabled={disabled}
      className={`${styles.input} ${touched && error ? styles.error : ''}`}
      aria-invalid={touched && error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {touched && error && (
      <span id={`${name}-error`} className={styles.errorMessage}>
        {error}
      </span>
    )}
  </div>
);

/**
 * File Input Component
 */
export const FileInput = ({ 
  label, 
  name, 
  onChange, 
  error, 
  touched,
  required = false,
  accept,
  multiple = false,
  disabled = false,
  className = ''
}) => (
  <div className={`${styles.formGroup} ${className}`}>
    {label && (
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
    )}
    <input
      id={name}
      name={name}
      type="file"
      onChange={(e) => onChange(name, e.target.files)}
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      className={`${styles.fileInput} ${touched && error ? styles.error : ''}`}
      aria-invalid={touched && error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {touched && error && (
      <span id={`${name}-error`} className={styles.errorMessage}>
        {error}
      </span>
    )}
  </div>
);

/**
 * Form Button Component
 */
export const Button = ({ 
  type = 'button',
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = ''
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
  >
    {loading ? (
      <>
        <span className={styles.spinner} />
        Processing...
      </>
    ) : children}
  </button>
);
