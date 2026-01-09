/**
 * Vercel Serverless Function: Backend Proxy
 * 
 * This function acts as an HTTPS proxy between the frontend (HTTPS) and backend (HTTP).
 * It forwards all requests to the Azure VM backend and returns responses transparently.
 * 
 * Route: /api/backend/[...path]
 * Example: /api/backend/room -> http://51.124.124.18/room
 * 
 * Uses Vercel's Web API format (Request/Response)
 */

export default async function handler(request) {
  // Get the backend URL from environment variable (default to Azure VM)
  const BACKEND_URL = process.env.BACKEND_URL || 'http://51.124.124.18';
  
  // Extract the path from the catch-all route
  // URL: /api/backend/room/ABC123 -> pathSegments = ['room', 'ABC123']
  const url = new URL(request.url);
  const pathMatch = url.pathname.match(/^\/api\/backend\/(.*)$/);
  const backendPath = pathMatch ? pathMatch[1] : '';
  
  // Construct the full backend URL
  const backendUrl = `${BACKEND_URL}/${backendPath}`;
  
  // Preserve query parameters from the original request
  const queryString = url.search;
  const fullBackendUrl = queryString 
    ? `${backendUrl}${queryString}`
    : backendUrl;
  
  console.log(`[Proxy] ${request.method} ${url.pathname} -> ${fullBackendUrl}`);
  
  try {
    // Prepare headers for the backend request
    const headers = new Headers();
    
    // Copy relevant headers from the original request
    request.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      const skipHeaders = ['host', 'connection', 'content-length', 'cf-ray', 'cf-connecting-ip'];
      if (!skipHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });
    
    // Get request body if present
    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
      try {
        body = await request.text();
      } catch (e) {
        // No body or already consumed
      }
    }
    
    // Forward the request to the backend
    const response = await fetch(fullBackendUrl, {
      method: request.method,
      headers: headers,
      body: body,
    });
    
    // Get the response body
    const contentType = response.headers.get('content-type') || '';
    let responseData;
    
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Prepare response headers
    const responseHeaders = new Headers();
    
    // Copy relevant headers from backend response
    response.headers.forEach((value, key) => {
      // Don't forward headers that should be set by Vercel
      const skipHeaders = ['content-encoding', 'transfer-encoding', 'connection', 'content-length'];
      if (!skipHeaders.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });
    
    // Set CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: responseHeaders,
      });
    }
    
    // Return the response
    return new Response(
      typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
      {
        status: response.status,
        headers: responseHeaders,
      }
    );
    
  } catch (error) {
    console.error(`[Proxy Error] ${error.message}`);
    console.error(`[Proxy Error] Failed to proxy ${request.method} ${url.pathname} to ${fullBackendUrl}`);
    
    // Return a proper error response
    return new Response(
      JSON.stringify({
        error: 'Bad Gateway',
        message: `Failed to connect to backend: ${error.message}`,
        backendUrl: fullBackendUrl,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

