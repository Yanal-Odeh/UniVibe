/**
 * Enhanced API utilities for better error handling and retry logic
 */

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Retry logic for failed requests
 */
export const retryRequest = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;
      const shouldRetry = error instanceof NetworkError || 
                         (error instanceof ApiError && error.status >= 500);
      
      if (isLastAttempt || !shouldRetry) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

/**
 * Request interceptor
 */
export const requestInterceptor = (config) => {
  // Add timestamp to prevent caching
  if (config.method === 'GET') {
    const url = new URL(config.url, window.location.origin);
    url.searchParams.append('_t', Date.now());
    config.url = url.toString();
  }
  
  // Add auth token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add request ID for tracing
  config.headers['X-Request-ID'] = generateRequestId();
  
  return config;
};

/**
 * Response interceptor
 */
export const responseInterceptor = async (response) => {
  // Log response for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Response] ${response.status} - ${response.url}`);
  }
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('unauthorized'));
    throw new ApiError('Session expired. Please login again.', 401);
  }
  
  // Handle other errors
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      data?.error || data?.message || 'Request failed',
      response.status,
      data
    );
  }
  
  return response;
};

/**
 * Error interceptor
 */
export const errorInterceptor = (error) => {
  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    throw new NetworkError('Network error. Please check your connection.');
  }
  
  // Timeout errors
  if (error.name === 'AbortError') {
    throw new NetworkError('Request timeout. Please try again.');
  }
  
  // Log errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', error);
  }
  
  throw error;
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format query parameters
 */
export const formatQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};

/**
 * Enhanced fetch wrapper with timeout
 */
export const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

/**
 * Batch requests
 */
export const batchRequests = async (requests, batchSize = 5) => {
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch);
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Cache utilities
 */
export class CacheManager {
  constructor(ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value, ttl = this.ttl) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Request queue for rate limiting
 */
export class RequestQueue {
  constructor(maxConcurrent = 6) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async add(requestFn) {
    if (this.running >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.running++;
    
    try {
      return await requestFn();
    } finally {
      this.running--;
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }
}

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
