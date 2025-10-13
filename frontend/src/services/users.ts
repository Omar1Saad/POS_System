import api from './api';
import { User, CreateUser, PaginatedResponse, ApiResponse } from '@/types';

export const userService = {
  // Get all users with pagination
  getAll: async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<User>> => {
    const res = await api.get('users', { params: { page, limit} })
    if (res.status !== 200) {
      return { data: [], total: 0, page: page, limit: limit, totalPages: 0 , message: res.data.message};
    }
    let filteredUsers = res.data.data;
    
    // Apply search filter
    if (search) {
      filteredUsers = res.data.filter((user:User) => 
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return {
      data: filteredUsers,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
      totalPages: res.data.totalPages,
    };
  },

  // Get user by ID
  getById: async (id: number): Promise<ApiResponse<User>> => {

    const res = await api.get(`users/${id}`);
    if (res.status !== 201) {
      return { data: null, success: false, message: res.data.message };
    }
    
    return { data: res.data, success: true };
  },

  // Create new user
  create: async (userData: CreateUser): Promise<ApiResponse<User>> => {
    
    const res = await api.post('users', userData);
    if (res.status !== 201) {
      return { data: null, success: false, message: res.data.message };
    }
    const newUser: User = res.data;
    return { data: newUser, success: true };
  },

  // Update user
  update: async (id: number, userData: Partial<CreateUser>): Promise<ApiResponse<User>> => {
    const res = await api.patch(`users/${id}`, userData);
    if (res.status !== 200) {
      return { data: null, success: false, message: res.data.message };
    }
    const updatedUser: User = res.data;
    return { data: updatedUser, success: true };
  },

  // Delete user
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await api.delete(`users/${id}`);
    if (res.status !== 200) {
      return { data: null, success: false, message: res.data.message };
    }
    return { data: undefined, success: true };  
  },

  // Bulk delete users
  bulkDelete: async (ids: number[])=> {
    const res = await api.delete(`/users/bulk`, {data:{ids}});
    if(res.status === 200){
      return { data: undefined, success: true };
    }
    return { data: null, success: false, message: res.data.message };
  }
};

