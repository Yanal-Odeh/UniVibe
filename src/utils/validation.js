/**
 * Form validation utilities
 */

/**
 * Common validation rules
 */
export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return '';
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Minimum ${min} characters required`;
    }
    return '';
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Maximum ${max} characters allowed`;
    }
    return '';
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message || 'Invalid format';
    }
    return '';
  },

  matches: (otherField, message) => (value, allValues) => {
    if (value !== allValues[otherField]) {
      return message || 'Fields do not match';
    }
    return '';
  },

  min: (minValue) => (value) => {
    if (value && Number(value) < minValue) {
      return `Minimum value is ${minValue}`;
    }
    return '';
  },

  max: (maxValue) => (value) => {
    if (value && Number(value) > maxValue) {
      return `Maximum value is ${maxValue}`;
    }
    return '';
  },

  url: (value) => {
    try {
      if (value) new URL(value);
      return '';
    } catch {
      return 'Please enter a valid URL';
    }
  },

  phone: (value) => {
    const phoneRegex = /^[\d\s()+-]+$/;
    if (value && !phoneRegex.test(value)) {
      return 'Please enter a valid phone number';
    }
    return '';
  },

  date: (value) => {
    if (value && isNaN(Date.parse(value))) {
      return 'Please enter a valid date';
    }
    return '';
  },

  futureDate: (value) => {
    if (value && new Date(value) <= new Date()) {
      return 'Date must be in the future';
    }
    return '';
  },

  pastDate: (value) => {
    if (value && new Date(value) >= new Date()) {
      return 'Date must be in the past';
    }
    return '';
  },

  custom: (validatorFn, message) => (value, allValues) => {
    if (!validatorFn(value, allValues)) {
      return message || 'Invalid value';
    }
    return '';
  }
};

/**
 * Compose multiple validators
 */
export const composeValidators = (...validators) => (value, allValues) => {
  for (const validator of validators) {
    const error = validator(value, allValues);
    if (error) return error;
  }
  return '';
};

/**
 * Validate entire form
 */
export const validateForm = (values, validationSchema) => {
  const errors = {};
  
  Object.keys(validationSchema).forEach(fieldName => {
    const fieldValidators = validationSchema[fieldName];
    const value = values[fieldName];
    
    if (Array.isArray(fieldValidators)) {
      // Multiple validators for this field
      for (const validator of fieldValidators) {
        const error = validator(value, values);
        if (error) {
          errors[fieldName] = error;
          break;
        }
      }
    } else {
      // Single validator
      const error = fieldValidators(value, values);
      if (error) {
        errors[fieldName] = error;
      }
    }
  });
  
  return errors;
};

/**
 * Common validation schemas for the app
 */
export const validationSchemas = {
  eventForm: {
    title: [
      validators.required,
      validators.minLength(3),
      validators.maxLength(100)
    ],
    description: [
      validators.required,
      validators.minLength(10),
      validators.maxLength(1000)
    ],
    collegeId: validators.required,
    locationId: validators.required,
    startDate: [
      validators.required,
      validators.date,
      validators.futureDate
    ],
    endDate: [
      validators.date,
      validators.custom(
        (endDate, allValues) => !endDate || new Date(endDate) > new Date(allValues.startDate),
        'End date must be after start date'
      )
    ],
    communityId: validators.required,
    capacity: [
      validators.min(1),
      validators.max(10000)
    ]
  },

  loginForm: {
    email: [validators.required, validators.email],
    password: [validators.required, validators.minLength(6)]
  },

  signupForm: {
    name: [validators.required, validators.minLength(2)],
    email: [validators.required, validators.email],
    password: [
      validators.required,
      validators.minLength(8),
      validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      )
    ],
    confirmPassword: [
      validators.required,
      validators.matches('password', 'Passwords must match')
    ]
  }
};

/**
 * Field-level validation helper
 */
export const validateField = (fieldName, value, schema, allValues = {}) => {
  const fieldValidators = schema[fieldName];
  if (!fieldValidators) return '';
  
  if (Array.isArray(fieldValidators)) {
    for (const validator of fieldValidators) {
      const error = validator(value, allValues);
      if (error) return error;
    }
  } else {
    return fieldValidators(value, allValues);
  }
  
  return '';
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Format error messages for display
 */
export const formatErrors = (errors) => {
  return Object.entries(errors)
    .map(([field, error]) => `${field}: ${error}`)
    .join('\n');
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first error from errors object
 */
export const getFirstError = (errors) => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};

/**
 * Validate on submit helper
 */
export const createFormSubmitHandler = (validationSchema, onSubmit) => {
  return (values) => {
    const errors = validateForm(values, validationSchema);
    
    if (hasErrors(errors)) {
      return { success: false, errors };
    }
    
    return onSubmit(values);
  };
};
