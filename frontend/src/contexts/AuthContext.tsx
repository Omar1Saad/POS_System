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
            // Additional validation - check if token is not expired
            try {
              const tokenPayload = JSON.parse(atob(savedToken.split('.')[1]));
              const currentTime = Math.floor(Date.now() / 1000);
              
              // Add buffer time (5 minutes) to prevent edge cases
              const bufferTime = 5 * 60; // 5 minutes in seconds
              
              if (tokenPayload.exp && (tokenPayload.exp - bufferTime) > currentTime) {
                setToken(savedToken);
                setUser(parsedUser);
              } else {
                // Token expired or about to expire, clear auth data
                clearAuthData();
              }
            } catch (tokenError) {
              // Invalid token format, clear auth data
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        } catch (error) {
          clearAuthData();
        }
      } else {
        // No saved data, ensure clean state
        clearAuthData();
      }
      
      setLoading(false);
    };
    
    // Use a small timeout to ensure DOM is ready and prevent hydration issues
    const timeoutId = setTimeout(initializeAuth, 50);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });      
      
      // Check if response is successful
      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Login failed');
      }
      
      const { access_token, user: userData } = response.data;
      
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
      console.error('Login error:', error);
      // Only clear auth data if it's a login-specific error
      if (error.message?.includes('Invalid email or password') || 
          error.message?.includes('Login failed') ||
          error.message?.includes('Invalid response')) {
        clearAuthData();
      }
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