/**
 * Vercel Serverless Function: Backend Proxy
 * 
 * This function acts as an HTTPS proxy between the frontend (HTTPS) and backend (HTTP).
 * It forwards all requests to the Azure VM backend and returns responses transparently.
 * 
 * Route: /api/proxy (with rewrites in vercel.json)
 * Example: /api/backend/room -> /api/proxy?path=room -> http://51.124.124.18/room
 * 
 * Uses Vercel's Node.js runtime format (req, res)
 */

export default async function handler(req, res) {
  // Log that the proxy function was called
  console.log("[Proxy] Function invoked - URL:", req.url, "Method:", req.method);
  
  // Handle OPTIONS preflight immediately
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(200).end();
  }

  // Get the backend URL from environment variable (default to Azure VM)
  const BACKEND_URL = process.env.BACKEND_URL || "http://51.124.124.18";

  // Extract the path from query parameter (passed by vercel.json rewrite)
  // Example: /api/backend/room -> rewrite -> /api/proxy?path=room
  // Example: /api/backend/room/ABC123 -> rewrite -> /api/proxy?path=room/ABC123
  let backendPath = req.query.path || "";

  // If path is an array, join it
  if (Array.isArray(backendPath)) {
    backendPath = backendPath.join("/");
  }

  // Fallback: If path is not in query, try to extract from URL
  // This handles cases where the rewrite might not work correctly
  // Also handle cases where path might be URL-encoded in the query
  if (!backendPath || backendPath === "") {
    // Try to decode if it's URL encoded
    if (req.query.path && typeof req.query.path === 'string') {
      try {
        backendPath = decodeURIComponent(req.query.path);
      } catch (e) {
        backendPath = req.query.path;
      }
    }
    
    // If still empty, extract from URL directly
    if (!backendPath && req.url) {
      const urlMatch = req.url.match(/\/api\/(?:backend|proxy)\/(.+?)(\?|$)/);
      if (urlMatch && urlMatch[1]) {
        backendPath = decodeURIComponent(urlMatch[1]);
        console.log("[Proxy Debug] Extracted path from URL:", backendPath);
      }
    }
  } else {
    // Decode the path if it's URL encoded
    try {
      backendPath = decodeURIComponent(backendPath);
    } catch (e) {
      // If decoding fails, use as-is
    }
  }

  console.log("[Proxy Debug] req.url:", req.url);
  console.log("[Proxy Debug] req.query:", JSON.stringify(req.query));
  console.log("[Proxy Debug] req.method:", req.method);
  console.log("[Proxy Debug] backendPath:", backendPath);

  // Construct the full backend URL
  let backendUrl;
  if (backendPath === "") {
    backendUrl = BACKEND_URL;
  } else {
    backendUrl = `${BACKEND_URL}/${backendPath}`;
  }

  // Preserve query parameters from the original request (except 'path')
  const queryParams = new URLSearchParams();
  Object.keys(req.query || {}).forEach((key) => {
    if (key !== "path") {
      const value = req.query[key];
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    }
  });
  const queryString = queryParams.toString();
  const fullBackendUrl = queryString
    ? `${backendUrl}?${queryString}`
    : backendUrl;

  console.log(`[Proxy] ${req.method} ${req.url} -> ${fullBackendUrl}`);

  try {
    // Prepare headers for the backend request
    const headers = { ...req.headers };

    // Remove headers that shouldn't be forwarded
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];
    delete headers["cf-ray"];
    delete headers["cf-connecting-ip"];
    delete headers["x-forwarded-for"];
    delete headers["x-vercel-id"];

    // Get request body if present
    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      // For POST/PUT/PATCH, send the body
      if (req.body) {
        body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }
    }

    // Forward the request to the backend
    const response = await fetch(fullBackendUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });

    // Get the response body
    const contentType = response.headers.get("content-type") || "";
    let responseData;
    let responseText = "";

    // Always get text first to check if it's HTML
    responseText = await response.text();
    
    // Check if response is HTML (error page) - check multiple patterns
    const trimmedText = responseText.trim();
    const isHTML = trimmedText.startsWith("<!DOCTYPE") || 
                   trimmedText.startsWith("<!doctype") ||
                   trimmedText.startsWith("<html") ||
                   trimmedText.startsWith("<HTML") ||
                   trimmedText.toLowerCase().includes("<html") ||
                   (trimmedText.startsWith("<") && trimmedText.includes("html"));
    
    if (isHTML) {
      console.error("[Proxy Error] Backend returned HTML instead of JSON");
      console.error("[Proxy Error] Response status:", response.status);
      console.error("[Proxy Error] Response preview:", trimmedText.substring(0, 500));
      console.error("[Proxy Error] Backend URL:", fullBackendUrl);
      
      // Return proper JSON error so frontend can handle it
      return res.status(502).json({
        error: "Bad Gateway",
        message: "Backend returned HTML error page instead of JSON. The backend may be down or the endpoint doesn't exist.",
        backendUrl: fullBackendUrl,
        statusCode: response.status,
        details: "Check backend logs and ensure the endpoint exists and returns JSON.",
      });
    }

    // Parse as JSON if content-type suggests JSON, or if text looks like JSON
    if (contentType.includes("application/json") || (responseText.trim().startsWith("{") || responseText.trim().startsWith("["))) {
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.warn("[Proxy] Failed to parse as JSON, returning as text:", e.message);
        responseData = responseText;
      }
    } else {
      responseData = responseText;
    }

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Copy relevant headers from backend response
    response.headers.forEach((value, key) => {
      // Don't forward headers that should be set by Vercel
      const skipHeaders = [
        "content-encoding",
        "transfer-encoding",
        "connection",
        "content-length",
      ];
      if (!skipHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Return the response
    res.status(response.status).json(responseData);
  } catch (error) {
    console.error(`[Proxy Error] ${error.message}`);
    console.error(
      `[Proxy Error] Failed to proxy ${req.method} ${req.url} to ${fullBackendUrl}`
    );

    // Return a proper error response
    res.status(502).json({
      error: "Bad Gateway",
      message: `Failed to connect to backend: ${error.message}`,
      backendUrl: fullBackendUrl,
    });
  }
}
