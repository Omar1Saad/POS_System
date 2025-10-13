import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getProfitSummary(): Promise<{
        todayProfit: number;
        thisWeekProfit: number;
        thisMonthProfit: number;
    }>;
    getProfitOverTime(period?: string): Promise<{
        date: string;
        profit: number;
    }[]>;
    getTopProfitableProducts(limit?: string): Promise<{
        productId: number;
        productName: string;
        totalProfit: number;
    }[]>;
}
