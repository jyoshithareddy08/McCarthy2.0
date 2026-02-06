const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const defaultHeaders = () => {
  const h = {};
  
  // Get JWT token from localStorage for authenticated requests
  if (typeof localStorage !== "undefined") {
    try {
      const tokens = localStorage.getItem("mccarthy_tokens");
      if (tokens) {
        const parsedTokens = JSON.parse(tokens);
        if (parsedTokens?.accessToken) {
          h["Authorization"] = `Bearer ${parsedTokens.accessToken}`;
          console.log(`[API] JWT token found and added to Authorization header`);
        } else {
          console.warn("[API] No accessToken found in mccarthy_tokens");
        }
      } else {
        console.warn("[API] No mccarthy_tokens found in localStorage");
      }
    } catch (e) {
      console.error("[API] Error parsing tokens from localStorage:", e);
    }
  }
  
  return h;
};

export const api = {
  get: (path, opts = {}) => {
    const headers = { ...defaultHeaders(), ...opts.headers };
    console.log(`[API GET] ${path}`, {
      headers: { ...headers, "Authorization": headers["Authorization"] ? "Bearer ***" : "MISSING" },
      timestamp: new Date().toISOString()
    });
    return fetch(`${BASE}${path}`, {
      method: "GET",
      headers,
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const errorDetails = {
          path,
          status: r.status,
          statusText: r.statusText,
          error: data.error,
          message: data.message,
          details: data.details,
          fullResponse: data,
          headers: Object.fromEntries(r.headers.entries()),
          timestamp: new Date().toISOString()
        };
        console.error(`[API GET ERROR] ${path}`, errorDetails);
        // Create a comprehensive error message
        let errorMsg = data.error || data.message || r.statusText || `Request failed with status ${r.status}`;
        if (data.details && typeof data.details === 'object') {
          const detailsStr = Object.entries(data.details)
            .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
            .join('\n');
          if (detailsStr) {
            errorMsg += `\n\nDetails:\n${detailsStr}`;
          }
        }
        const detailedError = new Error(errorMsg);
        detailedError.status = r.status;
        detailedError.details = errorDetails;
        detailedError.backendError = data.error;
        detailedError.backendMessage = data.message;
        detailedError.backendDetails = data.details;
        throw detailedError;
      }
      return data;
    });
  },

  post: (path, body, opts = {}) => {
    const headers = { "Content-Type": "application/json", ...defaultHeaders(), ...opts.headers };
    console.log(`[API POST] ${path}`, {
      headers: { ...headers, "Authorization": headers["Authorization"] ? "Bearer ***" : "MISSING" },
      body: body ? (typeof body === 'string' ? body.substring(0, 100) : JSON.stringify(body).substring(0, 100)) : null,
      timestamp: new Date().toISOString()
    });
    return fetch(`${BASE}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const errorDetails = {
          path,
          status: r.status,
          statusText: r.statusText,
          error: data.error,
          message: data.message,
          details: data.details,
          fullResponse: data,
          headers: Object.fromEntries(r.headers.entries()),
          requestBody: body,
          timestamp: new Date().toISOString()
        };
        console.error(`[API POST ERROR] ${path}`, errorDetails);
        // Create a comprehensive error message
        let errorMsg = data.error || data.message || r.statusText || `Request failed with status ${r.status}`;
        if (data.details && typeof data.details === 'object') {
          const detailsStr = Object.entries(data.details)
            .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
            .join('\n');
          if (detailsStr) {
            errorMsg += `\n\nDetails:\n${detailsStr}`;
          }
        }
        const detailedError = new Error(errorMsg);
        detailedError.status = r.status;
        detailedError.details = errorDetails;
        detailedError.backendError = data.error;
        detailedError.backendMessage = data.message;
        detailedError.backendDetails = data.details;
        throw detailedError;
      }
      return data;
    });
  },
};
