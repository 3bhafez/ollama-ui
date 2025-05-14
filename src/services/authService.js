import axios from 'axios';

const API_URL = 'http://ollamanetgateway.runasp.net/Auth';

// Helper functions for token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// store token
const storeToken = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get the stored token
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get the stored user
const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Remove the stored token and user
const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Check if a user is logged in and token is valid
const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) return false;
  
  // Check if token is expired
  if (user.expiresOn) {
    const expiry = new Date(user.expiresOn);
    if (expiry < new Date()) {
      
      removeToken();
      return false;
    }
  }
  
  return true;
};

// Register a new user
const register = async (email, password, username) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
      username
    });
    
    if (response.data.isAuthenticated) {
      const userData = {
        username: response.data.username,
        email: response.data.email,
        roles: response.data.roles,
        expiresOn: response.data.expiresOn,
        refreshTokenExpiration: response.data.refreshTokenExpiration
      };
      
      storeToken(response.data.token, userData);
      return userData;
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Login an existing user
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    
    if (response.data.isAuthenticated) {
      const userData = {
        username: response.data.username,
        email: response.data.email,
        roles: response.data.roles,
        expiresOn: response.data.expiresOn,
        refreshTokenExpiration: response.data.refreshTokenExpiration
      };
      
      storeToken(response.data.token, userData);
      return userData;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Logout the user
const logout = async () => {
  try {
    // API call to logout
    
    // Remove token from storage
    removeToken();
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    //remove token if API call fails
    removeToken();
    return false;
  }
};

// Add auth header to requests
const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // 401 responses
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Unauthorized, clear token and redirect to login
        removeToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

setupAxiosInterceptors();

export {
  register,
  login,
  logout,
  getToken,
  getUser,
  isAuthenticated
};
