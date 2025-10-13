import api from './api';
import { Product, CreateProduct, PaginatedResponse, ApiResponse } from '@/types';

export const productService = {
  // Get all products with pagination (MOCK)
  getAll: async (page = 1, limit = 10, search = '', categoryId?: number): Promise<PaginatedResponse<Product>> => {
    const res = await api.get('products', { params: { page, limit } });

    if (res.status !== 200) {
      return { data: [], total: 0, page: page, limit: limit, totalPages: 0 , message: res.data.message};
    }
    let filteredProducts = res.data.data;
    
    // Apply category filter
    if (categoryId) {
      filteredProducts = filteredProducts.filter((product: Product) => product.categoryId === categoryId);
    }
    
    // Apply search filter
    if (search) {
      filteredProducts = filteredProducts.filter((product: Product) => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode.includes(search)
      );
    }
    
    return {
      data: filteredProducts,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
      totalPages: res.data.totalPages,
    };
  },

  // Get all products without pagination (for dropdowns)
  getAllForDropdown: async (): Promise<ApiResponse<Product[]>> => {
    const res = await api.get('products');
    if (res.status !== 200) {
      return { data: [], success: false, message: res.data.message };
    }
    return { 
      data: res.data.data, 
      success: true 
    };
  },

  // Get product by ID
  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const res = await api.get(`products/${id}`);
    if (res.status !== 200) {
      return { data: {} as Product, success: false, message: res.data.message };
    }
    
    return { data: res.data.data, success: true };
  },

  // Get product by barcode
  getByBarcode: async (barcode: string): Promise<ApiResponse<Product>> => {
    const res = await api.get(`products/barcode/${barcode}`);
    if (res.status !== 200) {
      return { data: {} as Product, success: false, message: res.data.message };
    }
    return { data: res.data.data, success: true };
  },

  // Create new product
  create: async (productData: CreateProduct): Promise<ApiResponse<Product>> => {
    const res = await api.post('products', productData);
    if (res.status !== 201) {
      return { data: {} as Product, success: false, message: res.data.message };
    }
    const newProduct = res.data;
    return { data: newProduct, success: true };
  },

  // Update product
  update: async (id: number, productData: Partial<CreateProduct>): Promise<ApiResponse<Product>> => {
    const res = await api.patch(`products/${id}`, productData);
    if (res.status !== 200) {
      return { data: {} as Product, success: false, message: res.data.message };
    }
    const updatedProduct = res.data;
    return { data: updatedProduct, success: true };
  },

  // Update stock
  updateStock: async (id: number, quantity: number, operation: 'add' | 'subtract'): Promise<ApiResponse<Product>> => {
    
    return { data: {} as Product, success: true };
  },

  // Delete product
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await api.delete(`products/${id}`);
    if (res.status !== 200) {
      return { data: undefined, success: false, message: res.data.message };
    }
    return { data: undefined, success: true };
  },

  // Bulk delete products
  bulkDelete: async (ids: number[]): Promise<ApiResponse<void>> => {
    const res = await api.delete('products/bulk', { data: { ids } });
    if (res.status === 200) {
      return { data: undefined, success: true };
    }
    return { data: undefined, success: false, message: res.data.message };
  },
};