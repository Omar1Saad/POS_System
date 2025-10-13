import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth';

interface User {
  id: number;
  email: string;
  fullName: string;
  username: string;
  role: 'admin' | 'manager' | 'cashier';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'cashier';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook with proper export for HMR compatibility
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          // Validate that the parsed user has required fields
          if (parsedUser?.id && parsedUser?.email && parsedUser?.role) {
            setToken(savedToken);
            setUser(parsedUser);
          } else {
            clearAuthData();
          }
        } catch (error) {
          clearAuthData();
        }
      }
      
      setLoading(false);
    };
    
    // Use a small timeout to ensure DOM is ready and prevent hydration issues
    const timeoutId = setTimeout(initializeAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });      
      const { access_token, user: userData } = response.data;
      
      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Login failed');
      }
      
      if (!access_token || !userData) {
        throw new Error('Invalid response from server - missing token or user data');
      }
      
      // Validate user data structure
      if (!userData.id || !userData.email || !userData.role) {
        throw new Error('Invalid user data structure');
      }
            
      // Save to localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(access_token);
      setUser(userData);
                  
    } catch (error: any) {
      clearAuthData();
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      // After registration, you might want to auto-login
      // For now, we'll just return success
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setLoading(true);
    clearAuthData();
        
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await authService.changePassword({ oldPassword, newPassword });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook separately for better HMR compatibility
export { useAuth };