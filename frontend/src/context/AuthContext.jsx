import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mccarthy_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Load user on mount if tokens exist
  useEffect(() => {
    const loadUser = async () => {
      const tokens = JSON.parse(localStorage.getItem("mccarthy_tokens") || "null");
      
      if (tokens?.accessToken) {
        try {
          const response = await api.auth.getCurrentUser();
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            localStorage.setItem("mccarthy_user", JSON.stringify(data.user));
          } else {
            // Token might be invalid, clear everything
            localStorage.removeItem("mccarthy_tokens");
            localStorage.removeItem("mccarthy_user");
            setUser(null);
          }
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("mccarthy_tokens");
          localStorage.removeItem("mccarthy_user");
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.auth.login({ email, password });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Login failed" }));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      
      // Save tokens
      localStorage.setItem("mccarthy_tokens", JSON.stringify(data.tokens));
      
      // Save user
      setUser(data.user);
      localStorage.setItem("mccarthy_user", JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const signup = useCallback(async (email, password, name) => {
    try {
      const response = await api.auth.register({ 
        email, 
        password, 
        name,
        role: 'user'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Registration failed" }));
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      
      // Save tokens
      localStorage.setItem("mccarthy_tokens", JSON.stringify(data.tokens));
      
      // Save user
      setUser(data.user);
      localStorage.setItem("mccarthy_user", JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("mccarthy_user");
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
