import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'cashier';
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    username: string;
    role: 'admin' | 'manager' | 'cashier';
  };
}

export interface UserResponse {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  createdAt: string;
  updatedAt: string;
}


export const authService = {
  login:(data: LoginRequest) => api.post('/auth/login', data),
  register:(data: RegisterRequest)=> api.post('/auth/register', data),

  // Change password (MOCK - No Backend)
  changePassword: async (data: ChangePasswordRequest): Promise<{ data: { message: string } }> => {
    
    
    // In a real app, you'd verify the old password and update it
    return { data: { message: 'Password changed successfully' } };
  },

  // Get current user profile
  getProfile: async () => {
    // TODO: Implement when backend endpoint is available
    throw new Error('Profile endpoint not implemented yet');
  },
};