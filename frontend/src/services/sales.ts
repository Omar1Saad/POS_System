import api from './api';
import { Sale, CreateSale, SaleItem, CreateSaleItem, PaginatedResponse, ApiResponse } from '@/types';

export const saleService = {
  // Get all sales with pagination (MOCK)
  getAll: async (page = 1, limit = 10, search = '', status?: string): Promise<PaginatedResponse<Sale>> => {
    const res = await api.get('/sales', { params: { page, limit, search, status } });
    if(res.status !== 200) {
      return { data: [], total: 0, page: page, limit: limit, totalPages: 0 , message: res.data.message};
    }

    const sales = res.data.data.map((sale: Sale) => ({
      id: sale.id,
      // Ensure total is a valid number, handling comma-separated strings
      total: (() => {
        const total: any = sale.total;
        if (total === null || total === undefined) return 0;
        
        if (typeof total === 'string') {
          // Remove commas and any other non-numeric characters except decimal point and minus sign
          const cleanString = total.replace(/[^\d.-]/g, '');
          const parsed = parseFloat(cleanString);
          return isNaN(parsed) ? 0 : parsed;
        } else if (typeof total === 'number') {
          return isNaN(total) ? 0 : total;
        }
        
        return 0;
      })(),
      userId: sale.userId,
      customerId: sale.customerId,
      // Ensure paymentMethod is a valid string
      paymentMethod: sale.paymentMethod || 'cash',
      // Ensure status is a valid string
      status: sale.status || 'pending',
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      user: sale.user,
      customer: sale.customer,
    })) as Sale[];
    return {
      data: sales,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
      totalPages: res.data.totalPages,
    };
  },

  // Get sale by ID with items
  getById: async (id: number): Promise<ApiResponse<Sale>> => {
    try {
      const res = await api.get(`/sales/${id}`);
      if(res.status !== 200) {
        return { data: null, message: res.data?.message || 'Failed to fetch sale', success: false };
      }
      // Handle different response structures
      const saleData = res.data.data || res.data;
      return { data: saleData, message: res.data?.message || 'Sale fetched successfully', success: true };
    } catch (error: any) {
      return { data: null, message: error.response?.data?.message || 'Failed to fetch sale', success: false };
    }
  },

  // Create new sale with items (MOCK)
  create: async (saleData: CreateSale): Promise<ApiResponse<Sale>> => {
    const res = await api.post('/sales', saleData);
    if(res.status !== 201) {
      return { data: null, message: res.data.message, success: false };
    }
    return { data: res.data.data, message: res.data.message, success: true };
  },

  // Update sale
  update: async (id: number, saleData: any): Promise<ApiResponse<Sale>> => {
    try {
      const { total, paymentMethod, saleItems } = saleData;
      
      // First update the sale with total and payment method
      const res = await api.patch(`/sales/${id}`, {total, paymentMethod});
      
      // Then handle sale items if provided
      if(saleItems && saleItems.length > 0){
        const bulkRes = await api.post(`/sales-items/bulk`, saleItems);
        if(bulkRes.status !== 201) {
          return { data: null, message: bulkRes.data?.message || 'Failed to update sale items', success: false };
        }
      }
      
      if(res.status !== 200) {
        return { data: null, message: res.data?.message || 'Failed to update sale', success: false };
      }
      return { data: res.data.data, message: res.data.message, success: true };
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update sale';
      return { data: null, message: errorMessage, success: false };
    }
  },

  // Cancel sale
  cancel: async (id: number): Promise<ApiResponse<Sale>> => {
    const res = await api.patch(`/sales/${id}/cancel`);
    if(res.status !== 200) {
      return { data: null, message: res.data.message, success: false };
    }
    return { data: res.data, message: 'Sale cancelled successfully', success: true };
  },

  // Complete sale
  complete: async (id: number): Promise<ApiResponse<Sale>> => {
    try {
      const res = await api.patch(`/sales/${id}/complete`);
      if(res.status !== 200) {
        return { data: null, message: res.data?.message || 'Failed to complete sale', success: false };
      }
      return { data: res.data, message: 'Sale completed successfully', success: true };
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to complete sale';
      return { data: null, message: errorMessage, success: false };
    }
  },

  // Delete sale
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await api.delete(`/sales/${id}`);
    if(res.status !== 200) {
      return { data: null, message: res.data.message, success: false };
    }
    return { data: undefined, message: res.data.message, success: true };
  },

  getSummary: async (period = 'month'): Promise<ApiResponse<{
    totalSales: number;
    totalAmount: number;
    averageAmount: number;
    topProducts: Array<{ product: string; quantity: number; revenue: number }>;
  }>> => {
    try {
      const res = await api.get('/sales/summary', { params: { period } });
      if(res.status !== 200) {
        return { data: null, message: res.data.message, success: false };
      }
      
      // Ensure numeric values are properly converted and handle NaN
      const summaryData = {
        totalSales: Number(res.data.totalSales) || 0,
        totalAmount: Number(res.data.totalAmount) || 0,
        averageAmount: Number(res.data.averageAmount) || 0,
        topProducts: res.data.topProducts || []
      };
      
      return { data: summaryData, message: res.data.message || 'Summary fetched successfully', success: true };
    } catch (error: any) {
      return { data: null, message: error.response?.data?.message || 'Failed to fetch summary', success: false };
    }
  },
  deleteBulk: async (ids: number[]): Promise<ApiResponse<void>> => {
    const res = await api.delete('/sales/bulk', { data: { ids } });
    if(res.status !== 200) {
      return { data: null, message: res.data.message, success: false };
    }
    return { data: undefined, message: res.data.message, success: true };
  }
};