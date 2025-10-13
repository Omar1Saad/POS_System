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
exports.SaleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const sale_entity_1 = require("./entities/sale.entity");
const typeorm_2 = require("@nestjs/typeorm");
const customer_services_1 = require("../customers/customer.services");
const user_entity_1 = require("../users/entities/user.entity");
let SaleService = class SaleService {
    saleRepository;
    customerService;
    dataSource;
    constructor(saleRepository, customerService, dataSource) {
        this.saleRepository = saleRepository;
        this.customerService = customerService;
        this.dataSource = dataSource;
    }
    async createSale(createSaleDto, user) {
        const { customerId, paymentMethod } = createSaleDto;
        const customer = await this.customerService.getCustomerById(customerId);
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found!");
        }
        const sale = this.saleRepository.create({
            customerId,
            paymentMethod,
            userId: user.id
        });
        return this.saleRepository.save(sale);
    }
    async getSales(user, paginationResponse) {
        const where = {};
        if (user.role === user_entity_1.UserRole.CASHIER) {
            where.userId = user.id;
        }
        if (paginationResponse.status && paginationResponse.status !== 'all') {
            where.status = paginationResponse.status;
        }
        const { page, limit } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        const [sales, total] = await this.saleRepository.findAndCount({
            where,
            skip,
            take,
            relations: ['customer', 'user'],
            order: { createdAt: 'DESC' }
        });
        return {
            data: sales,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getSaleById(id, user) {
        const findSale = async () => {
            if (user?.role === user_entity_1.UserRole.CASHIER) {
                return await this.saleRepository.findOne({
                    where: { id, userId: user.id },
                    relations: ['customer', 'user', 'salesItems', 'salesItems.product']
                });
            }
            return await this.saleRepository.findOne({
                where: { id },
                relations: ['customer', 'user', 'salesItems', 'salesItems.product']
            });
        };
        const sale = await findSale();
        if (!sale) {
            throw new common_1.NotFoundException("Sale not found!");
        }
        return sale;
    }
    async updateSale(id, updateSaleDto, user) {
        const findSale = async () => {
            if (user.role === user_entity_1.UserRole.CASHIER) {
                return await this.saleRepository.findOne({ where: { id, userId: user.id } });
            }
            return await this.saleRepository.findOne({ where: { id } });
        };
        const sale = await findSale();
        if (!sale) {
            throw new common_1.NotFoundException("Sale not found!");
        }
        const { customerId, paymentMethod, status } = updateSaleDto;
        if (customerId) {
            const customer = await this.customerService.getCustomerById(customerId);
            if (!customer) {
                throw new common_1.NotFoundException("Customer not found!");
            }
            sale.customerId = customerId;
        }
        if (status === 'completed' && sale.status !== 'completed') {
            const updatedSale = await this.saleRepository.findOne({ where: { id }, relations: ['salesItems', 'salesItems.product'] });
            if (!updatedSale) {
                throw new common_1.NotFoundException("Sale not found!");
            }
            if (!updatedSale.salesItems || updatedSale.salesItems.length === 0) {
                throw new common_1.NotFoundException("Cannot complete sale: No items found in this sale. Please add products before completing the sale.");
            }
            if (updatedSale.total <= 0) {
                throw new common_1.NotFoundException("Cannot complete sale: Sale total is zero or negative. Please add items with valid prices before completing the sale.");
            }
            for (const item of updatedSale.salesItems) {
                const product = item.product;
                product.stock -= item.quantity;
                await this.saleRepository.manager.save(product);
            }
            sale.status = status;
        }
        if (status === 'pending' && sale.status === 'completed') {
            const updatedSale = await this.saleRepository.findOne({ where: { id }, relations: ['salesItems', 'salesItems.product'] });
            if (!updatedSale) {
                throw new common_1.NotFoundException("Sale not found!");
            }
            for (const item of updatedSale.salesItems) {
                const product = item.product;
                product.stock += item.quantity;
                await this.saleRepository.manager.save(product);
            }
            sale.status = status;
        }
        sale.paymentMethod = paymentMethod || sale.paymentMethod;
        sale.status = status || sale.status;
        return this.saleRepository.save(sale);
    }
    async updateSaleTotal(id, total) {
        const sale = await this.saleRepository.findOne({ where: { id } });
        if (!sale) {
            throw new common_1.NotFoundException("Sale not found!");
        }
        if (total < 0) {
            throw new common_1.NotFoundException("Total must be greater than or equal to zero!");
        }
        sale.total = total;
        return this.saleRepository.save(sale);
    }
    async delete(id, user) {
        const findSale = async () => {
            if (user.role === user_entity_1.UserRole.CASHIER) {
                return await this.saleRepository.findOne({ where: { id, userId: user.id } });
            }
            return await this.saleRepository.findOne({ where: { id } });
        };
        const sale = await findSale();
        if (!sale) {
            throw new common_1.NotFoundException("Sale not found!");
        }
        if (sale.status === 'completed' && user.role === user_entity_1.UserRole.CASHIER) {
            throw new common_1.NotFoundException("Sale cannot be deleted because it is completed!");
        }
        await this.saleRepository.delete(id);
        return { "success": "Sale deleted successfully!" };
    }
    async completeSale(id, user) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const findSale = async () => {
                if (user.role === user_entity_1.UserRole.CASHIER) {
                    return await queryRunner.manager.findOne(sale_entity_1.Sale, { where: { id, userId: user.id } });
                }
                return await queryRunner.manager.findOne(sale_entity_1.Sale, { where: { id } });
            };
            const sale = await findSale();
            if (!sale) {
                throw new common_1.NotFoundException("Sale not found!");
            }
            if (sale.status === 'cancelled') {
                throw new common_1.NotFoundException("Cannot complete a cancelled sale");
            }
            if (sale.status !== 'completed') {
                const updatedSale = await queryRunner.manager.findOne(sale_entity_1.Sale, {
                    where: { id },
                    relations: ['salesItems', 'salesItems.product']
                });
                if (!updatedSale) {
                    throw new common_1.NotFoundException("Sale not found!");
                }
                if (!updatedSale.salesItems || updatedSale.salesItems.length === 0) {
                    throw new common_1.NotFoundException("Cannot complete sale: No items found in this sale. Please add products before completing the sale.");
                }
                if (updatedSale.total <= 0) {
                    throw new common_1.NotFoundException("Cannot complete sale: Sale total is zero or negative. Please add items with valid prices before completing the sale.");
                }
                for (const item of updatedSale.salesItems) {
                    const product = item.product;
                    if (product.stock < item.quantity) {
                        throw new common_1.NotFoundException(`Cannot complete sale due to insufficient stock for product "${product.name}". Available stock: ${product.stock}, Required: ${item.quantity}. Please update the sale or restock the product.`);
                    }
                    product.stock -= item.quantity;
                    await queryRunner.manager.save(product);
                }
            }
            const saleWithItems = await queryRunner.manager.findOne(sale_entity_1.Sale, {
                where: { id },
                relations: ['salesItems']
            });
            let totalProfit = 0;
            if (saleWithItems && saleWithItems.salesItems) {
                for (const item of saleWithItems.salesItems) {
                    const itemProfit = (item.unitPrice - item.costAtTimeOfSale) * item.quantity;
                    totalProfit += itemProfit;
                }
            }
            sale.status = 'completed';
            sale.profit = totalProfit;
            sale.updatedAt = new Date();
            const completedSale = await queryRunner.manager.save(sale);
            await queryRunner.commitTransaction();
            return {
                data: completedSale,
                totalProfit: totalProfit,
                message: 'Sale completed successfully'
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async cancelSale(id, user) {
        const findSale = async () => {
            if (user.role === user_entity_1.UserRole.CASHIER) {
                return await this.saleRepository.findOne({ where: { id, userId: user.id } });
            }
            return await this.saleRepository.findOne({ where: { id } });
        };
        const sale = await findSale();
        if (!sale) {
            throw new common_1.NotFoundException("Sale not found!");
        }
        if (sale.status === 'completed') {
            throw new common_1.NotFoundException("Cannot cancel a completed sale");
        }
        sale.status = 'cancelled';
        sale.updatedAt = new Date();
        return this.saleRepository.save(sale);
    }
    async deleteBulk(ids) {
        const sales = await this.saleRepository.findBy({ id: (0, typeorm_1.In)(ids) });
        if (sales.length !== ids.length) {
            throw new common_1.NotFoundException("One Or More Sale not found!");
        }
        await this.saleRepository.delete(ids);
        return { 'message': 'Deleted Sale was Successfully!' };
    }
    async getSummary(period = 'month', user) {
        try {
            const now = new Date();
            let startDate = new Date();
            switch (period) {
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    startDate.setMonth(now.getMonth() - 1);
            }
            const whereCondition = {
                status: 'completed'
            };
            if (user && user.role === user_entity_1.UserRole.CASHIER) {
                whereCondition.userId = user.id;
            }
            const completedSales = await this.saleRepository.find({
                where: whereCondition,
                relations: ['salesItems']
            });
            const filteredSales = completedSales.filter(sale => {
                const saleDate = new Date(sale.createdAt);
                return saleDate >= startDate && saleDate <= now;
            });
            const totalSales = filteredSales.length;
            const totalAmount = filteredSales.reduce((sum, sale) => {
                const saleTotal = sale.total;
                let numericTotal = 0;
                if (saleTotal !== null && saleTotal !== undefined) {
                    if (typeof saleTotal === 'string') {
                        numericTotal = parseFloat(saleTotal) || 0;
                    }
                    else if (typeof saleTotal === 'number') {
                        numericTotal = isNaN(saleTotal) ? 0 : saleTotal;
                    }
                }
                return sum + numericTotal;
            }, 0);
            const averageAmount = totalSales > 0 ? totalAmount / totalSales : 0;
            const productSales = {};
            filteredSales.forEach(sale => {
                if (sale.salesItems && sale.salesItems.length > 0) {
                    sale.salesItems.forEach(item => {
                        const productName = `Product ${item.productId}`;
                        if (!productSales[productName]) {
                            productSales[productName] = { quantity: 0, revenue: 0 };
                        }
                        const quantity = item.quantity !== null && item.quantity !== undefined ?
                            (typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0) : 0;
                        let revenue = 0;
                        if (item.total !== null && item.total !== undefined) {
                            if (typeof item.total === 'string') {
                                revenue = parseFloat(item.total) || 0;
                            }
                            else if (typeof item.total === 'number') {
                                revenue = isNaN(item.total) ? 0 : item.total;
                            }
                        }
                        productSales[productName].quantity += quantity;
                        productSales[productName].revenue += revenue;
                    });
                }
            });
            const topProducts = Object.entries(productSales)
                .map(([product, data]) => ({ product, ...data }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);
            return {
                totalSales,
                totalAmount,
                averageAmount,
                topProducts,
            };
        }
        catch (error) {
            console.error('Error in getSummary:', error);
            return {
                totalSales: 0,
                totalAmount: 0,
                averageAmount: 0,
                topProducts: [],
            };
        }
    }
};
exports.SaleService = SaleService;
exports.SaleService = SaleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(sale_entity_1.Sale)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        customer_services_1.CustomerService,
        typeorm_1.DataSource])
], SaleService);
//# sourceMappingURL=sale.services.js.map