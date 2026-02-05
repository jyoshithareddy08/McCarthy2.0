import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mccarthy_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email, _password) => {
    const userData = {
      id: "1",
      email,
      name: email.split("@")[0],
      avatar: null,
    };
    setUser(userData);
    localStorage.setItem("mccarthy_user", JSON.stringify(userData));
  }, []);

  const signup = useCallback((email, _password, name) => {
    const userData = {
      id: "1",
      email,
      name: name || email.split("@")[0],
      avatar: null,
    };
    setUser(userData);
    localStorage.setItem("mccarthy_user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("mccarthy_user");
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
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
