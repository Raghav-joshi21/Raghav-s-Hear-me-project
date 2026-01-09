/**
 * API Configuration Utility
 * Returns the correct backend URL based on environment
 * 
 * In production (Vercel): Uses /api proxy (configured in vercel.json)
 * In development: Uses VITE_BACKEND_URL or localhost
 */

/**
 * Get the base URL for API calls
 * @returns {string} Base URL for backend API
 */
export const getApiBaseUrl = () => {
  // Check if we're running on HTTPS (Vercel production) - always use /api proxy
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return '/api';
  }
  
  // In production build but local testing, use /api if PROD is true
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // In development, use environment variable or localhost
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
};

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - API endpoint (e.g., '/room', '/predict')
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

