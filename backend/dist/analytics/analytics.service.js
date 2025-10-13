"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sale_entity_1 = require("../sales/entities/sale.entity");
const salesItems_entity_1 = require("../sales_items/entities/salesItems.entity");
const product_entity_1 = require("../product/entities/product.entity");
let AnalyticsService = class AnalyticsService {
    saleRepository;
    salesItemsRepository;
    productsRepository;
    constructor(saleRepository, salesItemsRepository, productsRepository) {
        this.saleRepository = saleRepository;
        this.salesItemsRepository = salesItemsRepository;
        this.productsRepository = productsRepository;
    }
    async getProfitSummary() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const mondayStart = new Date(now);
        mondayStart.setDate(now.getDate() + mondayOffset);
        mondayStart.setHours(0, 0, 0, 0);
        const sundayEnd = new Date(mondayStart);
        sundayEnd.setDate(mondayStart.getDate() + 6);
        sundayEnd.setHours(23, 59, 59, 999);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const [todaySales, thisWeekSales, thisMonthSales] = await Promise.all([
            this.getCompletedSalesInRange(todayStart, todayEnd),
            this.getCompletedSalesInRange(mondayStart, sundayEnd),
            this.getCompletedSalesInRange(monthStart, monthEnd)
        ]);
        const todayProfit = this.calculateTotalProfit(todaySales);
        const thisWeekProfit = this.calculateTotalProfit(thisWeekSales);
        const thisMonthProfit = this.calculateTotalProfit(thisMonthSales);
        return {
            todayProfit: Math.round(todayProfit * 100) / 100,
            thisWeekProfit: Math.round(thisWeekProfit * 100) / 100,
            thisMonthProfit: Math.round(thisMonthProfit * 100) / 100,
        };
    }
    async getProfitOverTime(period = '30d') {
        const days = parseInt(period.replace('d', ''));
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        const sales = await this.getCompletedSalesInRange(startDate, endDate);
        const profitByDate = {};
        sales.forEach(sale => {
            const saleDate = sale.createdAt.toISOString().split('T')[0];
            const saleProfit = this.calculateSaleProfit(sale);
            if (!profitByDate[saleDate]) {
                profitByDate[saleDate] = 0;
            }
            profitByDate[saleDate] += saleProfit;
        });
        const result = [];
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
    async getTopProfitableProducts(limit = 5) {
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
        const productProfits = {};
        sales.forEach(sale => {
            sale.salesItems.forEach(item => {
                const itemProfit = (item.unitPrice - item.costAtTimeOfSale) * item.quantity;
                if (!productProfits[item.productId]) {
                    productProfits[item.productId] = {
                        name: `Product ${item.productId}`,
                        totalProfit: 0
                    };
                }
                productProfits[item.productId].totalProfit += itemProfit;
            });
        });
        const productIds = Object.keys(productProfits).map(id => parseInt(id));
        if (productIds.length > 0) {
            const products = await this.productsRepository.find({
                where: { id: (0, typeorm_2.In)(productIds) },
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
    async getCompletedSalesInRange(startDate, endDate) {
        return this.saleRepository.find({
            where: {
                status: 'completed',
                createdAt: (0, typeorm_2.Between)(startDate, endDate)
            },
            relations: ['salesItems']
        });
    }
    calculateTotalProfit(sales) {
        return sales.reduce((total, sale) => {
            return total + this.calculateSaleProfit(sale);
        }, 0);
    }
    calculateSaleProfit(sale) {
        if (!sale.salesItems)
            return 0;
        return sale.salesItems.reduce((saleProfit, item) => {
            const itemProfit = (item.unitPrice - item.costAtTimeOfSale) * item.quantity;
            return saleProfit + itemProfit;
        }, 0);
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sale_entity_1.Sale)),
    __param(1, (0, typeorm_1.InjectRepository)(salesItems_entity_1.SalesItems)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Products)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map