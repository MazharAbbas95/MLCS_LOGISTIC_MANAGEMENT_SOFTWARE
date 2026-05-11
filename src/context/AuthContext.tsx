import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('mlcs_token');
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('mlcs_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('mlcs_token');
    localStorage.removeItem('mlcs_user');
    localStorage.removeItem('mlcs_auth'); // Cleanup legacy
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn('Authentication expired event received. Logging out globally.');
      logout();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password })
      });

      const result = await response.json();
      
      if (result.success) {
        const { token, user: userData } = result.data;
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('mlcs_token', token);
        localStorage.setItem('mlcs_user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const updatePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('mlcs_token');
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update password' };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
