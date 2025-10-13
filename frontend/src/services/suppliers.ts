import api from './api';
import { Supplier, CreateSupplier, PaginatedResponse, ApiResponse } from '@/types';


export const supplierService = {
  // Get all suppliers with pagination (MOCK)
  getAll: async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<Supplier>> => {
   const res = await api.get('suppliers', { params: { page, limit} })
    if (res.status !== 200) {
      return { data: [], total: 0, page: page, limit: limit, totalPages: 0 , message: res.data.message};
    }
    let filteredSuppliers = res.data.data;
    
    // Apply search filter
    if (search) {
      filteredSuppliers = filteredSuppliers.filter((supplier:Supplier) => 
        supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.email.toLowerCase().includes(search.toLowerCase()) ||
        supplier.phone.includes(search) ||
        supplier.address.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return {
      data: filteredSuppliers,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
      totalPages: res.data.totalPages,
    };
  },

  // Get all suppliers without pagination (for dropdowns) (MOCK)
  getAllForDropdown: async (): Promise<ApiResponse<Supplier[]>> => {
    const data:Supplier[] = await api.get('/suppliers').then(res => res.data.data);    
    return { 
      data: data, 
      success: true 
    };
  },

  // Get supplier by ID (MOCK)
  getById: async (id: number): Promise<ApiResponse<Supplier>> => {
    const res = await api.get(`suppliers/${id}`);
    if (res.status !== 201) {
      return { data: null, success: false, message: res.data.message };
    }
    
    return { data: res.data, success: true };
  },

  // Create new supplier (MOCK)
  create: async (supplierData: CreateSupplier): Promise<ApiResponse<Supplier>> => {
     const res = await api.post('suppliers', supplierData);
    if (res.status !== 201) {
      return { data: null, success: false, message: res.data.message };
    }
    const newUser: Supplier = res.data;
    return { data: newUser, success: true };
  },

  // Update supplier (MOCK)
  update: async (id: number, supplierData: Partial<CreateSupplier>): Promise<ApiResponse<Supplier>> => {
    const res = await api.patch(`suppliers/${id}`, supplierData);
    console.log(res.data)
    if (res.status !== 200) {
      return { data: null, success: false, message: res.data.message };
    }
    const updatedUser: Supplier = res.data;
    return { data: updatedUser, success: true };
  },

  // Delete supplier (MOCK)
  delete: async (id: number): Promise<ApiResponse<void>> => {
   const res = await api.delete(`suppliers/${id}`);
    if (res.status !== 200) {
      return { data: null, success: false, message: res.data.message };
    }
    return { data: undefined, success: true };  
  },

  // Bulk delete suppliers (MOCK)
  bulkDelete: async (ids: number[]): Promise<ApiResponse<void>> => {
   const res = await api.delete(`/suppliers/bulk`, {data:{ids}});
    if(res.status === 200){
      return { data: undefined, success: true };
    }
    return { data: null, success: false, message: res.data.message };
  },
};