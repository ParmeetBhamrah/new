import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  abha_id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (abha_id: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (abha_id: string, phone: string) => {
    try {
      const response = await authAPI.login(abha_id, phone);
      const { access_token, abha_user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(abha_user));
      setUser(abha_user);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};