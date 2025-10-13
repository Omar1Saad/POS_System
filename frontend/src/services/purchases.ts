import api from './api';
import { Purchase, CreatePurchase, PurchaseItem, CreatePurchaseItem, PaginatedResponse, ApiResponse } from '@/types';

export const purchaseService = {
  // Get all purchases with pagination
  getAll: async (page = 1, limit = 10, search = '', status?: string): Promise<PaginatedResponse<Purchase>> => {
    const res = await api.get('/purchases', { params: { page, limit, search, status } });
    if(res.status !== 200) {
      return { data: [], total: 0, page: page, limit: limit, totalPages: 0, message: res.data.message};
    }

    const purchases = res.data.data.map((purchase: Purchase) => ({
      id: purchase.id,
      // Ensure total is a valid number, handling comma-separated strings
      total: (() => {
        const total: any = purchase.total;
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
      supplierId: purchase.supplierId,
      userId: purchase.userId,
      // Ensure status is a valid string
      status: purchase.status || 'pending',
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      supplier: purchase.supplier,
      user: purchase.user,
    })) as Purchase[];
    
    return {
      data: purchases,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
      totalPages: res.data.totalPages,
    };
  },

  // Get purchase by ID with items
  getById: async (id: number): Promise<ApiResponse<Purchase>> => {
    try {
      const res = await api.get(`/purchases/${id}`);
      if(res.status !== 200) {
        return { data: null, message: res.data?.message || 'Failed to fetch purchase', success: false };
      }
      // Handle different response structures
      const purchaseData = res.data.data || res.data;
      return { data: purchaseData, message: res.data?.message || 'Purchase fetched successfully', success: true };
    } catch (error: any) {
      return { data: null, message: error.response?.data?.message || 'Failed to fetch purchase', success: false };
    }
  },

  // Create new purchase with items
  create: async (purchaseData: CreatePurchase & { items?: CreatePurchaseItem[] }): Promise<ApiResponse<Purchase>> => {
    const res = await api.post('/purchases', purchaseData);
    if(res.status !== 201) {
      return { data: null, message: res.data.message, success: false };
    }
    return { data: res.data.data, message: res.data.message, success: true };
  },

  // Update purchase
  update: async (id: number, purchaseData: Partial<CreatePurchase> & { purchaseItems?: any[] }): Promise<ApiResponse<Purchase>> => {
    try {
      // Send all data in one request to the purchase update endpoint
      const res = await api.patch(`/purchases/${id}`, purchaseData);
      
      if(res.status !== 200) {
        return { data: null, message: res.data?.message || 'Failed to update purchase', success: false };
      }
      return { data: res.data.data, message: res.data.message, success: true };
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update purchase';
      return { data: null, message: errorMessage, success: false };
    }
  },

  // Cancel purchase
  cancel: async (id: number): Promise<ApiResponse<Purchase>> => {
    const res = await api.patch(`/purchases/${id}/cancel`);
    if(res.status !== 200) {
      return { data: null, message: res.data.message, success: false };
    }
    return { data: res.data.data, message: 'Purchase cancelled successfully', success: true };
  },

  // Complete purchase
  complete: async (id: number): Promise<ApiResponse<Purchase>> => {
    try {
      const res = await api.patch(`/purchases/${id}/complete`);
      if(res.status !== 200) {
        return { data: null, message: res.data?.message || 'Failed to complete purchase', success: false };
      }
      return { data: res.data.data, message: 'Purchase completed successfully', success: true };
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to complete purchase';
      return { data: null, message: errorMessage, success: false };
    }
  },

  // Delete purchase
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await api.delete(`/purchases/${id}`);
    if(res.status !== 200) {
      return { data: null, message: res.data.message, success: false };
    }
    return { data: undefined, message: res.data.message, success: true };
  },

  getSummary: async (period = 'month'): Promise<ApiResponse<{
    totalPurchases: number;
    totalAmount: number;
    averageAmount: number;
    topSuppliers: Array<{ supplier: string; orders: number; amount: number }>;
  }>> => {
    try {
      const res = await api.get('/purchases/summary', { params: { period } });
      if(res.status !== 200) {
        return { data: null, message: res.data.message, success: false };
      }
      
      // Ensure numeric values are properly converted and handle NaN
      const summaryData = {
        totalPurchases: Number(res.data.totalPurchases) || 0,
        totalAmount: Number(res.data.totalAmount) || 0,
        averageAmount: Number(res.data.averageAmount) || 0,
        topSuppliers: res.data.topSuppliers || []
      };
      
      return { data: summaryData, message: res.data.message || 'Summary fetched successfully', success: true };
    } catch (error: any) {
      return { data: null, message: error.response?.data?.message || 'Failed to fetch summary', success: false };
    }
  },
  deleteBulk: async (ids: number[]): Promise<ApiResponse<void>> => {
    const res = await api.delete('/purchases/bulk', { data: { ids } });
    if(res.status !== 200) {
      return { data: null, message: res.data.message, success: false };
    }
    return { data: undefined, message: res.data.message, success: true };
  }
};