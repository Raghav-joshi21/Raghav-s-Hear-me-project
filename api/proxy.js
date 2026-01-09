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
  if (!backendPath && req.url) {
    const urlMatch = req.url.match(/\/api\/backend\/(.+?)(\?|$)/);
    if (urlMatch && urlMatch[1]) {
      backendPath = urlMatch[1];
      console.log("[Proxy Debug] Extracted path from URL:", backendPath);
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

    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
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
