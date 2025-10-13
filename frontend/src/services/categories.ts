import type { ApiResponse, Category, CreateCategory, PaginatedResponse } from '../types';
import api from './api';


export const categoryService = {
  // Get all categories with pagination
  getAll: async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<Category>> => {
    const res = await api.get('/categories', {params:{page, limit}})
    if (res.status !== 200) {
      return { data: [], total: 0, page: page, limit: limit, totalPages: 0 , message: res.data.message};
    }

    let filteredCategories = res.data.data;

    if (search) {
      filteredCategories = res.data.filter((category:Category)=> 
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return {
      data: filteredCategories,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
      totalPages: res.data.totalPages,
    };
  },

  // Get all categories without pagination (for dropdowns)
  getAllForDropdown: async (): Promise<ApiResponse<Category[]>> => {
    const data:Category[] = await api.get('/categories').then(res => res.data.data);    
    return { 
      data: data, 
      success: true 
    };
  },

  getById: async (id: number): Promise<ApiResponse<Category>> => {
    const res = await api.get(`/categories/${id}`);
    if (res.status !== 201) {
      return { data: null, success: false, message: res.data.message };
    }
    
    return { data: res.data, success: true };
  },

  create: async (categoryData: CreateCategory):Promise<ApiResponse<Category>> => {
    const res = await api.post(`/categories`, categoryData);
    console.log(res.status)
    if(res.status < 200 || res.status >299){
      return {data:null ,message: res.data.message, success: false};
    }
    return { data: res.data, success: true };
  },

  update: async (id: number, categoryData: Partial<CreateCategory>): Promise<ApiResponse<Category>> => {
    const res = await api.patch(`/categories/${id}`, categoryData);
    if (res.status !== 200) {
      return { data: null, success: false, message: res.data.message };
    }
    return { data: res.data, success: true };
  },

  // Delete category
  delete: async (id: number): Promise<ApiResponse<void>> => {
      const res = await api.delete(`/categories/${id}`);
      if(res.status !== 200){
        return { data: null, success: false, message: res.data.message };
      }
      return { data: null, success: true, message: res.data.message };
  },

  // Bulk delete categories
  bulkDelete: async (ids: number[])=> {
    const res = await api.delete(`/categories/bulk`, {data:{ids}});
    if(res.status === 200){
      return { data: null, success: true, message: res.data.message };
    }
    return { data: null, success: false, message: res.data.message };
  },
};