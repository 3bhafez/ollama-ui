import { createContext, useState, useEffect, useContext } from 'react';
import { register, login, logout, getUser, isAuthenticated } from '../services/authService';

const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = () => {
      if (isAuthenticated()) {
        setUser(getUser());
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Register handler
  const handleRegister = async (email, password, username) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await register(email, password, username);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await login(email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const checkAuthenticated = () => {
    return isAuthenticated();
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    register: handleRegister,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: checkAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
