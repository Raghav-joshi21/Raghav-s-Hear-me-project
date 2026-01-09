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
  // CRITICAL: Check hostname FIRST (before any env vars) to detect Vercel
  // This ensures we ALWAYS use /api proxy on Vercel, even if VITE_BACKEND_URL is set
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isVercel = hostname.includes('vercel.app') || hostname.includes('vercel.com');
    const isHTTPS = window.location.protocol === 'https:';
    
    if (isVercel || isHTTPS) {
      console.log('🔒 Vercel/HTTPS detected, using /api proxy (ignoring VITE_BACKEND_URL)');
      return '/api';
    }
  }
  
  // In production build (but not HTTPS - local testing), use /api if PROD is true
  if (import.meta.env.PROD) {
    console.log('📦 Production build detected, using /api');
    return '/api';
  }
  
  // In development (HTTP localhost), use environment variable or localhost
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) {
    // NEVER use HTTP URLs that would cause mixed content errors
    if (envUrl.startsWith('http://') && !envUrl.includes('localhost')) {
      console.warn('⚠️ VITE_BACKEND_URL is HTTP (not localhost), ignoring to prevent mixed content. Using /api instead.');
      return '/api';
    }
    console.log('🔧 Using VITE_BACKEND_URL:', envUrl);
    return envUrl;
  }
  
  console.log('🏠 Using default localhost:8000');
  return 'http://localhost:8000';
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

