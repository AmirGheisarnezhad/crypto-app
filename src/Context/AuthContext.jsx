import { createContext, useState, useEffect } from "react";

// ایجاد Context برای احراز هویت
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access_token"));

  const login = (accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  const refreshAuthToken = async () => {
    const oldRefreshToken = localStorage.getItem("refresh_token");
    if (!oldRefreshToken) return logout();

    const newTokenData = await refreshToken(oldRefreshToken);
    if (newTokenData) {
      login(newTokenData.access_token, newTokenData.refresh_token);
    } else {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, refreshAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

