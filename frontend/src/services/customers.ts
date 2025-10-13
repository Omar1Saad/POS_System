import api from './api';
import { Customer, CreateCustomer, PaginatedResponse, ApiResponse } from '@/types';

export const customerService = {
  // Get all customers with pagination
  getAll: async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<Customer>> => {
    const res = await api.get('customer', { params: { page, limit} })
    if (res.status !== 200) {
      return { data: [], total: 0, page: page, limit: limit, totalPages: 0 , message: res.data.message};
    }
    let filteredCustomers = res.data.data;
    
    // Apply search filter
     if (search) {
      filteredCustomers = filteredCustomers.filter((customer:Customer) => 
        customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search)
      );
    }
    

    return {
      data: filteredCustomers,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
      totalPages: res.data.totalPages,
    };
  },

  // Get all customers without pagination (for dropdowns)
  getAllForDropdown: async (): Promise<ApiResponse<Customer[]>> => {
    try {
      const res = await api.get('customer');
      if (res.status !== 200) {
        return { data: [], success: false, message: res.data?.message || 'Failed to fetch customers' };
      }
      const customerData = res.data?.data || res.data || [];
      return { data: customerData, success: true };
    } catch (error: any) {
      console.error('Error fetching customers for dropdown:', error);
      // Return empty array instead of failing completely
      return { data: [], success: false, message: error.message || 'Failed to fetch customers' };
    }
  },

  // Get customer by ID
  getById: async (id: number): Promise<ApiResponse<Customer>> => {
   const res = await api.get(`customer/${id}`);
    if (res.status !== 201) {
      return { data: null, success: false, message: res.data.message };
    }
    
    return { data: res.data, success: true };
  },

  // Create new customer
  create: async (customerData: CreateCustomer): Promise<ApiResponse<Customer>> => {
    const res = await api.post('customer', customerData);
    if (res.status !== 201) {
      return { data: null, success: false, message: res.data.message };
    }
    const newUser: Customer = res.data;
    return { data: newUser, success: true };
  },

  // Update customer
  update: async (id: number, customerData: Partial<CreateCustomer>): Promise<ApiResponse<Customer>> => {
   const res = await api.patch(`customer/${id}`, customerData);
   console.log(res.data.message)
    if (res.status !== 200) {
      return { data: null, success: false, message: res.data.message };
    }
    const updatedUser: Customer = res.data;
    return { data: updatedUser, success: true };
  },

  // Delete customer
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await api.delete(`customer/${id}`);
    if (res.status !== 200) {
      return { data: null, success: false, message: res.data.message };
    }
    return { data: undefined, success: true };
  },

  // Bulk delete customers
  bulkDelete: async (ids: number[]): Promise<ApiResponse<void>> => {
     const res = await api.delete(`/customer/bulk`, {data:{ids}});
    if(res.status === 200){
      return { data: undefined, success: true };
    }
    return { data: null, success: false, message: res.data.message };
  },

  // Export customers to CSV
  exportToCSV: async (customerIds?: number[]): Promise<Blob> => {
    const res = await api.get('customer')
    if (res.status !== 200) {
      throw new Error(res.data.message);
    }
    
    let customersToExport = res.data.data;
    
    // Filter by IDs if provided
    if (customerIds && customerIds.length > 0) {
      customersToExport = customersToExport.filter((customer:Customer) => 
        customerIds.includes(customer.id)
      );
    }
    
    // Create CSV content
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Created Date', 'Last Updated'];
    const csvContent = [
      headers.join(','),
      ...customersToExport.map((customer:Customer) => [
        customer.id,
        `"${customer.fullName}"`,
        `"${customer.email}"`,
        `"${customer.phone}"`,
        new Date(customer.createdAt).toLocaleDateString(),
        new Date(customer.updatedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  },
};