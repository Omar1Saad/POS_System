import api from './api';
import { DashboardSummary, Product, Sale } from '../types';

export const dashboardService = {
  // Get dashboard summary data from real API endpoints
  getSummary: async (): Promise<{ data: DashboardSummary }> => {
    
    try {
      // Make parallel API calls to get all the data we need
      const [
        salesSummary,
        purchasesSummary,
        productsResponse,
        customersResponse,
        suppliersResponse,
        recentSalesResponse
      ] = await Promise.all([
        api.get('/sales/summary'),
        api.get('/purchases/summary'),
        api.get('/products?page=1&limit=1000'), // Get all products to count low stock
        api.get('/customer?page=1&limit=1000'), // Get all customers
        api.get('/suppliers?page=1&limit=1000'), // Get all suppliers
        api.get('/sales?page=1&limit=5&status=completed') // Get recent completed sales
      ]);

      // Extract data from responses
      const salesData = salesSummary.data;
      const purchasesData = purchasesSummary.data;
      const products = productsResponse.data.data || [];
      const customers = customersResponse.data.data || [];
      const suppliers = suppliersResponse.data.data || [];
      const recentSales = recentSalesResponse.data.data || [];

      // Helper function to safely convert to number
      const safeNumber = (value: unknown): number => {
        if (typeof value === 'number') return isNaN(value) ? 0 : value;
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      // Calculate low stock products (assuming low stock is < 10)
      const lowStockProducts = products.filter((product: Product) => product.stock < 10);

      // Get top products (products with highest stock, or we could implement a better metric)
      const topProducts = products
        .sort((a: Product, b: Product) => b.stock - a.stock)
        .slice(0, 5);

      // Calculate trends (comparing current period with previous period)
      const salesTrend = salesData?.trend ? {
        current: salesData.total ?? 0,
        previous: salesData.previousTotal ?? 0,
        percentage: salesData.percentage ?? 0
      } : undefined;

      const purchasesTrend = purchasesData?.trend ? {
        current: purchasesData.total ?? 0,
        previous: purchasesData.previousTotal ?? 0,
        percentage: purchasesData.percentage ?? 0
      } : undefined;

      const dashboardSummary: DashboardSummary = {
        totalSales: safeNumber(salesData?.total ?? salesData?.totalAmount ?? 0),
        totalPurchases: safeNumber(purchasesData?.total ?? purchasesData?.totalAmount ?? 0),
        totalProducts: products.length,
        lowStockProducts: lowStockProducts.length,
        totalCustomers: customers.length,
        totalSuppliers: suppliers.length,
        recentSales: recentSales.map((sale: any) => ({
          ...sale,
          total: safeNumber(sale.total)
        })),
        topProducts: topProducts.map((product: any) => ({
          ...product,
          price: safeNumber(product.price),
          stock: safeNumber(product.stock)
        })),
        salesTrend,
        purchasesTrend
      };

      return { data: dashboardSummary };

    } catch (error) {
      
      // Return fallback data if API calls fail
      return {
        data: {
          totalSales: 0,
          totalPurchases: 0,
          totalProducts: 0,
          lowStockProducts: 0,
          totalCustomers: 0,
          totalSuppliers: 0,
          recentSales: [],
          topProducts: []
        }
      };
    }
  },

  // Get low stock products from real API
  getLowStockProducts: async (limit?: number): Promise<{ data: Product[] }> => {
    
    try {
      const response = await api.get('/products?page=1&limit=1000');
      const products = response.data.data || [];
      
      // Filter products with low stock (< 10)
      const lowStockProducts = products.filter((product: Product) => product.stock < 10);
      
      // Apply limit if specified
      const limitedProducts = limit ? lowStockProducts.slice(0, limit) : lowStockProducts;
      
      return { data: limitedProducts };
      
    } catch (error) {
      return { data: [] };
    }
  },

  // Get top products from real API
  getTopProducts: async (limit?: number): Promise<{ data: Product[] }> => {
    
    try {
      const response = await api.get('/products?page=1&limit=1000');
      const products = response.data.data || [];
      
      // Sort by stock (highest first) - in a real scenario, you might sort by sales volume
      const topProducts = products
        .sort((a: Product, b: Product) => b.stock - a.stock)
        .slice(0, limit || 5);
      
      return { data: topProducts };
      
    } catch (error) {
      return { data: [] };
    }
  },

  // Get sales analytics from real API
  getSalesAnalytics: async (days?: number): Promise<{ data: any }> => {
    
    try {
      const period = days ? (days <= 7 ? 'week' : days <= 30 ? 'month' : 'year') : 'month';
      const response = await api.get(`/sales/summary?period=${period}`);
      
      return { data: response.data };
      
    } catch (error) {
      return { 
        data: {
          period: days || 30,
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          dailyData: []
        }
      };
    }
  }
};