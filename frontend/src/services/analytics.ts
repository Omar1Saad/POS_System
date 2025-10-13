import api from './api';
import { ProfitSummary, ProfitOverTime, TopProfitableProduct } from '../types';

export const analyticsService = {
  // Get profit summary for today, this week, and this month
  getProfitSummary: async (): Promise<ProfitSummary> => {
    console.log('📊 Analytics: Fetching profit summary...');
    
    try {
      const response = await api.get('/analytics/summary');
      console.log('✅ Analytics: Profit summary fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Analytics: Error fetching profit summary:', error);
      throw error;
    }
  },

  // Get profit over time data for charts
  getProfitOverTime: async (period: string = '30d'): Promise<ProfitOverTime[]> => {
    console.log('📈 Analytics: Fetching profit over time for period:', period);
    
    try {
      const response = await api.get(`/analytics/profit-over-time?period=${period}`);
      console.log('✅ Analytics: Profit over time data fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Analytics: Error fetching profit over time:', error);
      throw error;
    }
  },

  // Get top profitable products
  getTopProfitableProducts: async (limit: number = 5): Promise<TopProfitableProduct[]> => {
    console.log('🏆 Analytics: Fetching top profitable products, limit:', limit);
    
    try {
      const response = await api.get(`/analytics/top-products?limit=${limit}`);
      console.log('✅ Analytics: Top profitable products fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Analytics: Error fetching top profitable products:', error);
      throw error;
    }
  }
};
