import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  collegeId?: number;
  ledCommunities?: any[];
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  signup: (userData: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        console.log('Token found, verifying...');
        const user = await api.getCurrentUser();
        console.log('=== Current User from API ===');
        console.log('User:', user?.firstName, user?.lastName);
        console.log('Role:', user?.role);
        console.log('Led Communities:', JSON.stringify(user?.ledCommunities, null, 2));
        
        if (user) {
          setCurrentUser({
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
          await AsyncStorage.removeItem('token');
        }
      } else {
        console.log('No token found in AsyncStorage');
      }
    } catch (err) {
      console.error('Failed to verify auth:', err);
      await AsyncStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
      const data = await api.login(email, password);
      console.log('Login response:', data);
      
      if (data.user && data.token) {
        // Store token
        await AsyncStorage.setItem('token', data.token);
        
        console.log('=== Login User Data ===');
        console.log('User role:', data.user.role);
        console.log('Led Communities:', JSON.stringify(data.user.ledCommunities, null, 2));
        
        const userData: User = {
          id: data.user.id,
          email: data.user.email,
          name: `${data.user.firstName} ${data.user.lastName}`,
          role: data.user.role,
          collegeId: data.user.collegeId,
          ledCommunities: data.user.ledCommunities || []
        };
        setCurrentUser(userData);
        return { success: true, user: userData };
      } else {
        console.log('No user data in response');
        await AsyncStorage.removeItem('token');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Invalid email or password' };
    }
  };

  const signup = async (userData: any) => {
    try {
      console.log('Attempting signup with:', userData.email);
      const data = await api.signup(userData);
      console.log('Signup response:', data);
      
      if (data.user && data.token) {
        // Store token
        await AsyncStorage.setItem('token', data.token);
        
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: `${data.user.firstName} ${data.user.lastName}`,
          role: data.user.role,
          collegeId: data.user.collegeId,
          ledCommunities: data.user.ledCommunities || []
        };
        setCurrentUser(user);
        return { success: true, user };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      return { success: false, error: err.message || 'Failed to create account' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      await AsyncStorage.removeItem('token');
    }
  };

  const value: AuthContextType = {
    currentUser,
    isLoading,
    login,
    logout,
    signup,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
