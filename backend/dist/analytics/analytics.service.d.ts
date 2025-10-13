import { Repository } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { SalesItems } from '../sales_items/entities/salesItems.entity';
import { Products } from '../product/entities/product.entity';
export declare class AnalyticsService {
    private readonly saleRepository;
    private readonly salesItemsRepository;
    private readonly productsRepository;
    constructor(saleRepository: Repository<Sale>, salesItemsRepository: Repository<SalesItems>, productsRepository: Repository<Products>);
    getProfitSummary(): Promise<{
        todayProfit: number;
        thisWeekProfit: number;
        thisMonthProfit: number;
    }>;
    getProfitOverTime(period?: string): Promise<Array<{
        date: string;
        profit: number;
    }>>;
    getTopProfitableProducts(limit?: number): Promise<Array<{
        productId: number;
        productName: string;
        totalProfit: number;
    }>>;
    private getCompletedSalesInRange;
    private calculateTotalProfit;
    private calculateSaleProfit;
}
