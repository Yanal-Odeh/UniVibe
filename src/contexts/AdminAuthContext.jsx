import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in (from token)
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Token found, verifying...');
          const user = await api.getCurrentUser();
          console.log('Current user from API:', user);
          // Set user data for any authenticated user
          if (user) {
            setCurrentAdmin({
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
              collegeId: user.collegeId,
              ledCommunities: user.ledCommunities || []
            });
            console.log('User authenticated successfully:', user.role);
          } else {
            console.log('No user data returned');
            localStorage.removeItem('token');
          }
        } else {
          console.log('No token found in localStorage');
        }
      } catch (err) {
        console.error('Failed to verify admin auth:', err);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const data = await api.login(email, password);
      console.log('Login response:', data);
      
      // Accept any authenticated user
      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: `${data.user.firstName} ${data.user.lastName}`,
          role: data.user.role,
          collegeId: data.user.collegeId,
          ledCommunities: data.user.ledCommunities || []
        };
        setCurrentAdmin(userData);
        return { success: true, user: userData };
      } else {
        console.log('No user data in response');
        localStorage.removeItem('token');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Invalid email or password' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentAdmin(null);
      localStorage.removeItem('token');
    }
  };

  const value = {
    currentAdmin,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentAdmin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
