import React, { createContext, useContext, useState, useEffect } from 'react';
import { signupUser, loginUser, getMe } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        try {
          const res = await getMe();
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to load user info:', error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signup = async (name, email, password, rememberMe = true) => {
    try {
      const res = await signupUser(name, email, password);
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem('token', res.token);
        } else {
          sessionStorage.setItem('token', res.token);
        }
        setUser(res.user);
        toast.success(`Welcome, ${res.user.name}!`);
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const login = async (email, password, rememberMe = true) => {
    try {
      const res = await loginUser(email, password);
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem('token', res.token);
        } else {
          sessionStorage.setItem('token', res.token);
        }
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // loginWithToken: stores a JWT (not a password) in browser storage.
  // localStorage is used only when rememberMe=true (user's explicit choice).
  // sessionStorage is used otherwise — token is cleared on tab close.
  const loginWithToken = (token, userData, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        const res = await getMe();
        if (res.success) {
          setUser(res.user);
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        loginWithToken,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
