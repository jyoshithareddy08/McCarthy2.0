/**
 * API utility with automatic token refresh
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Store refresh promise to prevent multiple simultaneous refresh calls
let refreshPromise = null;

/**
 * Get stored tokens from localStorage
 */
const getTokens = () => {
  try {
    const tokens = localStorage.getItem('mccarthy_tokens');
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Save tokens to localStorage
 */
const saveTokens = (tokens) => {
  localStorage.setItem('mccarthy_tokens', JSON.stringify(tokens));
};

/**
 * Clear tokens from localStorage
 */
const clearTokens = () => {
  localStorage.removeItem('mccarthy_tokens');
  localStorage.removeItem('mccarthy_user');
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async () => {
  // If refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const tokens = getTokens();
      
      if (!tokens || !tokens.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If refresh token is invalid/expired, clear tokens and redirect to login
        if (response.status === 401) {
          clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }

        throw new Error(errorData.message || 'Failed to refresh token');
      }

      const data = await response.json();
      
      // Update access token
      const newTokens = {
        ...tokens,
        accessToken: data.tokens.accessToken
      };
      
      saveTokens(newTokens);
      
      return newTokens.accessToken;
    } catch (error) {
      clearTokens();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Make authenticated API request with automatic token refresh
 */
export const apiRequest = async (url, options = {}) => {
  const tokens = getTokens();
  const accessToken = tokens?.accessToken;

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add authorization header if token exists
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Make initial request
  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && tokens?.refreshToken) {
    try {
      // Get new access token
      const newAccessToken = await refreshAccessToken();
      
      // Retry request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers
      });
    } catch (error) {
      // Refresh failed, clear tokens and redirect
      clearTokens();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
      throw error;
    }
  }

  return response;
};

/**
 * API methods
 */
export const api = {
  // Auth endpoints
  auth: {
    register: async (data) => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response;
    },
    
    login: async (data) => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response;
    },
    
    logout: async () => {
      const tokens = getTokens();
      if (tokens?.refreshToken) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken })
        });
      }
      clearTokens();
    },
    
    getCurrentUser: async () => {
      return await apiRequest('/api/auth/me');
    }
  },

  // Generic request method (use this for all authenticated requests)
  request: apiRequest
};

export default api;

