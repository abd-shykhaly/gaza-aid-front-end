import { useState, useEffect } from "react";
import { authStorage, AUTH_STATE_CHANGED } from "../utils/auth";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const token = authStorage.getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener(AUTH_STATE_CHANGED, handleAuthChange);
    return () =>
      window.removeEventListener(AUTH_STATE_CHANGED, handleAuthChange);
  }, []);

  return { isAuthenticated, loading };
};
