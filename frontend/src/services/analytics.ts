import api from './api';
import { ProfitSummary, ProfitOverTime, TopProfitableProduct } from '../types';

export const analyticsService = {
  // Get profit summary for today, this week, and this month
  getProfitSummary: async (): Promise<ProfitSummary> => {
    
    try {
      const response = await api.get('/analytics/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get profit over time data for charts
  getProfitOverTime: async (period: string = '30d'): Promise<ProfitOverTime[]> => {
    
    try {
      const response = await api.get(`/analytics/profit-over-time?period=${period}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get top profitable products
  getTopProfitableProducts: async (limit: number = 5): Promise<TopProfitableProduct[]> => {
    
    try {
      const response = await api.get(`/analytics/top-products?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
