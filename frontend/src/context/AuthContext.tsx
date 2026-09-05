import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi, RegistrationPendingData } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<RegistrationPendingData>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lifeos_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('lifeos_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to restore authentication state:', error);
          localStorage.removeItem('lifeos_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('lifeos_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    return authApi.register({ name, email, password });
  };

  const verifyOtp = async (email: string, code: string) => {
    const res = await authApi.verifyRegistration({ email, code });
    localStorage.setItem('lifeos_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('lifeos_token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (token) {
      const userData = await authApi.getMe();
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
