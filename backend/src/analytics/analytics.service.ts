import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { SalesItems } from '../sales_items/entities/salesItems.entity';
import { Products } from '../product/entities/product.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SalesItems)
    private readonly salesItemsRepository: Repository<SalesItems>,
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
  ) {}

  async getProfitSummary(): Promise<{
    todayProfit: number;
    thisWeekProfit: number;
    thisMonthProfit: number;
  }> {
    const now = new Date();
    
    // Get today's date range
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    // Get this week's date range (Monday to Sunday)
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as 0
    const mondayStart = new Date(now);
    mondayStart.setDate(now.getDate() + mondayOffset);
    mondayStart.setHours(0, 0, 0, 0);
    const sundayEnd = new Date(mondayStart);
    sundayEnd.setDate(mondayStart.getDate() + 6);
    sundayEnd.setHours(23, 59, 59, 999);
    
    // Get this month's date range
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get completed sales with sales items for each period
    const [todaySales, thisWeekSales, thisMonthSales] = await Promise.all([
      this.getCompletedSalesInRange(todayStart, todayEnd),
      this.getCompletedSalesInRange(mondayStart, sundayEnd),
      this.getCompletedSalesInRange(monthStart, monthEnd)
    ]);

    // Calculate profits for each period
    const todayProfit = this.calculateTotalProfit(todaySales);
    const thisWeekProfit = this.calculateTotalProfit(thisWeekSales);
    const thisMonthProfit = this.calculateTotalProfit(thisMonthSales);

    return {
      todayProfit: Math.round(todayProfit * 100) / 100,
      thisWeekProfit: Math.round(thisWeekProfit * 100) / 100,
      thisMonthProfit: Math.round(thisMonthProfit * 100) / 100,
    };
  }

  async getProfitOverTime(period: string = '30d'): Promise<Array<{ date: string; profit: number }>> {
    const days = parseInt(period.replace('d', ''));
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const sales = await this.getCompletedSalesInRange(startDate, endDate);
    
    // Group sales by date
    const profitByDate: { [key: string]: number } = {};
    
    sales.forEach(sale => {
      const saleDate = sale.createdAt.toISOString().split('T')[0];
      const saleProfit = this.calculateSaleProfit(sale);
      
      if (!profitByDate[saleDate]) {
        profitByDate[saleDate] = 0;
      }
      profitByDate[saleDate] += saleProfit;
    });

    // Generate array of dates with profit data
    const result: Array<{ date: string; profit: number }> = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        profit: Math.round((profitByDate[dateStr] || 0) * 100) / 100
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  async getTopProfitableProducts(limit: number = 5): Promise<Array<{
    productId: number;
    productName: string;
    totalProfit: number;
  }>> {
    // Get all completed sales with their sales items - optimize by selecting only needed fields
    const sales = await this.saleRepository.find({
      where: { status: 'completed' },
      relations: ['salesItems'],
      select: {
        id: true,
        salesItems: {
          id: true,
          productId: true,
          quantity: true,
          unitPrice: true,
          costAtTimeOfSale: true
        }
      }
    });

    // Group sales items by product and calculate total profit
    const productProfits: { [key: number]: { name: string; totalProfit: number } } = {};

    sales.forEach(sale => {
      sale.salesItems.forEach(item => {
        const itemProfit = (item.unitPrice - item.costAtTimeOfSale) * item.quantity;
        
        if (!productProfits[item.productId]) {
          productProfits[item.productId] = {
            name: `Product ${item.productId}`, // We'll update this with actual product name
            totalProfit: 0
          };
        }
        productProfits[item.productId].totalProfit += itemProfit;
      });
    });

    // Get product names - optimize by selecting only needed fields
    const productIds = Object.keys(productProfits).map(id => parseInt(id));
    if (productIds.length > 0) {
      const products = await this.productsRepository.find({
        where: { id: In(productIds) },
        select: {
          id: true,
          name: true
        }
      });

      products.forEach(product => {
        if (productProfits[product.id]) {
          productProfits[product.id].name = product.name;
        }
      });
    }

    // Convert to array and sort by profit
    const result = Object.entries(productProfits)
      .map(([productId, data]) => ({
        productId: parseInt(productId),
        productName: data.name,
        totalProfit: Math.round(data.totalProfit * 100) / 100
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, limit);

    return result;
  }

  private async getCompletedSalesInRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return this.saleRepository.find({
      where: {
        status: 'completed',
        createdAt: Between(startDate, endDate)
      },
      relations: ['salesItems']
    });
  }

  private calculateTotalProfit(sales: Sale[]): number {
    return sales.reduce((total, sale) => {
      return total + this.calculateSaleProfit(sale);
    }, 0);
  }

  private calculateSaleProfit(sale: Sale): number {
    if (!sale.salesItems) return 0;
    
    return sale.salesItems.reduce((saleProfit, item) => {
      const itemProfit = (item.unitPrice - item.costAtTimeOfSale) * item.quantity;
      return saleProfit + itemProfit;
    }, 0);
  }
}
