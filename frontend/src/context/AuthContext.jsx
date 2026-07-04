import React, { createContext, useContext, useState, useEffect } from 'react';
import { signupUser, loginUser, getMe } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getMe();
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to load user info:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signup = async (name, email, password) => {
    try {
      const res = await signupUser(name, email, password);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        toast.success(`Welcome, ${res.user.name}!`);
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await loginUser(email, password);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const loginWithToken = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
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
