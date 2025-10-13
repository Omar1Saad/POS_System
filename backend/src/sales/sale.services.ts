import { Injectable, NotFoundException } from "@nestjs/common";
import { FindManyOptions, In, Repository, DataSource } from "typeorm";
import { Sale } from "./entities/sale.entity";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerService } from "src/customers/customer.services";
import { UserRole } from "src/users/entities/user.entity";
import { DataResponse, PaginationResponse } from "../common/types";




@Injectable()
export class SaleService {
    constructor(
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>,
        private readonly customerService: CustomerService,
        private readonly dataSource: DataSource
    ){}

    async createSale(createSaleDto:CreateSaleDto, user:any): Promise<Sale> {
        const { customerId, paymentMethod} = createSaleDto;
        const customer = await this.customerService.getCustomerById(customerId);
        if(!customer){
            throw new NotFoundException("Customer not found!")
        }
        const sale = this.saleRepository.create({
            customerId,
            paymentMethod,
            userId: user.id
        });
        return this.saleRepository.save(sale);
    }

    async getSales(user, paginationResponse: PaginationResponse & { search?: string; status?: string }): Promise<DataResponse<Sale>> {
        const where: FindManyOptions<Sale>['where'] = {}
        if(user.role === UserRole.CASHIER){
            where.userId = user.id
        }

        // Add status filter
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
            relations:['customer', 'user'],
            order: { createdAt: 'DESC' }
        });

        // For now, we'll return the sales as-is since search filtering
        // should be handled at the database level for proper pagination
        // TODO: Implement proper database-level search filtering
        
        return { 
            data: sales, 
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getSaleById(id:number, user?:any): Promise<Sale> {
        const findSale = async () => {
            if(user?.role === UserRole.CASHIER){
                return await this.saleRepository.findOne({ 
                    where: { id, userId: user.id }, 
                    relations:['customer', 'user', 'salesItems', 'salesItems.product']
                });
            }
            return await this.saleRepository.findOne({ 
                where: { id }, 
                relations:['customer', 'user', 'salesItems', 'salesItems.product']
            });
        }
        const sale = await findSale();
        if(!sale){
            throw new NotFoundException("Sale not found!")
        }
        return sale;
    }

    async updateSale(id:number, updateSaleDto:UpdateSaleDto, user:any): Promise<Sale> {
        const findSale = async () => {
            if(user.role === UserRole.CASHIER){
                return await this.saleRepository.findOne({ where: { id, userId: user.id }});
            }
            return await this.saleRepository.findOne({ where: { id }});
        }
        const sale = await findSale();
        if(!sale){
            throw new NotFoundException("Sale not found!")
        }
        const { customerId, paymentMethod, status } = updateSaleDto;
        if(customerId){
            const customer = await this.customerService.getCustomerById(customerId);
            if(!customer){
                throw new NotFoundException("Customer not found!")
            }
            sale.customerId = customerId 
        }

        if(status === 'completed' && sale.status !== 'completed' ){
            const updatedSale = await this.saleRepository.findOne({ where: { id }, relations: ['salesItems', 'salesItems.product']});
            if(!updatedSale){
                throw new NotFoundException("Sale not found!")
            }
            
            // Validate that sale has items
            if (!updatedSale.salesItems || updatedSale.salesItems.length === 0) {
                throw new NotFoundException("Cannot complete sale: No items found in this sale. Please add products before completing the sale.");
            }
            
            // Validate that sale total is greater than zero
            if (updatedSale.total <= 0) {
                throw new NotFoundException("Cannot complete sale: Sale total is zero or negative. Please add items with valid prices before completing the sale.");
            }
            
            for (const item of updatedSale.salesItems) {
                const product = item.product;
                product.stock -= item.quantity;
                await this.saleRepository.manager.save(product);
            }
            sale.status = status
        }
        if(status === 'pending' && sale.status === 'completed' ){
            const updatedSale = await this.saleRepository.findOne({ where: { id }, relations: ['salesItems', 'salesItems.product']});
            if(!updatedSale){
                throw new NotFoundException("Sale not found!")
            }
            for (const item of updatedSale.salesItems) {
                const product = item.product;
                product.stock += item.quantity;
                await this.saleRepository.manager.save(product);
            }
            sale.status = status
        }
        
        sale.paymentMethod = paymentMethod || sale.paymentMethod
        sale.status = status || sale.status
        return this.saleRepository.save(sale);
    }
    
    async updateSaleTotal(id:number, total:number): Promise<Sale> {
        const sale = await this.saleRepository.findOne({ where: { id } });
        if(!sale){
            throw new NotFoundException("Sale not found!")
        }
        if(total < 0) {
            throw new NotFoundException("Total must be greater than or equal to zero!")
        }
        sale.total = total;
        return this.saleRepository.save(sale);
    }

    async delete(id:number, user:any): Promise<{}> {
        const findSale = async () => {
            if(user.role === UserRole.CASHIER){
                return await this.saleRepository.findOne({ where: { id, userId: user.id }});
            }
            return await this.saleRepository.findOne({ where: { id }});
        }
        const sale = await findSale();
        if(!sale){
            throw new NotFoundException("Sale not found!")
        }
        if(sale.status === 'completed' && user.role === UserRole.CASHIER){
            throw new NotFoundException("Sale cannot be deleted because it is completed!")
        }
        await this.saleRepository.delete(id);
        return {"success": "Sale deleted successfully!"};
    }

    async completeSale(id: number, user: any): Promise<{data: Sale, totalProfit: number, message: string}> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const findSale = async () => {
                if(user.role === UserRole.CASHIER){
                    return await queryRunner.manager.findOne(Sale, { where: { id, userId: user.id }});
                }
                return await queryRunner.manager.findOne(Sale, { where: { id }});
            }
            const sale = await findSale();
            if(!sale){
                throw new NotFoundException("Sale not found!")
            }
            
            if (sale.status === 'cancelled') {
                throw new NotFoundException("Cannot complete a cancelled sale");
            }
            
            // If sale is not already completed, validate and deduct stock
            if (sale.status !== 'completed') {
                const updatedSale = await queryRunner.manager.findOne(Sale, { 
                    where: { id }, 
                    relations: ['salesItems', 'salesItems.product']
                });
                
                if (!updatedSale) {
                    throw new NotFoundException("Sale not found!");
                }
                
                // Validate that sale has items
                if (!updatedSale.salesItems || updatedSale.salesItems.length === 0) {
                    throw new NotFoundException("Cannot complete sale: No items found in this sale. Please add products before completing the sale.");
                }
                
                // Validate that sale total is greater than zero
                if (updatedSale.total <= 0) {
                    throw new NotFoundException("Cannot complete sale: Sale total is zero or negative. Please add items with valid prices before completing the sale.");
                }
                
                // Deduct stock for each item
                for (const item of updatedSale.salesItems) {
                    const product = item.product;
                    if (product.stock < item.quantity) {
                        throw new NotFoundException(`Cannot complete sale due to insufficient stock for product "${product.name}". Available stock: ${product.stock}, Required: ${item.quantity}. Please update the sale or restock the product.`);
                    }
                    product.stock -= item.quantity;
                    await queryRunner.manager.save(product);
                }
            }
            
            // Calculate total profit for the sale
            const saleWithItems = await queryRunner.manager.findOne(Sale, {
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
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async cancelSale(id: number, user: any): Promise<Sale> {
        const findSale = async () => {
            if(user.role === UserRole.CASHIER){
                return await this.saleRepository.findOne({ where: { id, userId: user.id }});
            }
            return await this.saleRepository.findOne({ where: { id }});
        }
        const sale = await findSale();
        if(!sale){
            throw new NotFoundException("Sale not found!")
        }
        
        if (sale.status === 'completed') {
            throw new NotFoundException("Cannot cancel a completed sale");
        }
        
        sale.status = 'cancelled';
        sale.updatedAt = new Date();
        return this.saleRepository.save(sale);
    }

    async deleteBulk(ids:number[]):Promise<{}>{
        const sales = await this.saleRepository.findBy({ id: In(ids) });
        if(sales.length !== ids.length){
          throw new NotFoundException("One Or More Sale not found!")
        }
        await this.saleRepository.delete(ids)
        return {'message':'Deleted Sale was Successfully!'}
      }

    async getSummary(period: string = 'month', user?: any): Promise<{
        totalSales: number;
        totalAmount: number;
        averageAmount: number;
        topProducts: Array<{ product: string; quantity: number; revenue: number }>;
    }> {
        try {
            // Get completed sales for the specified period
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

            // Build where condition based on user role
            const whereCondition: any = {
                status: 'completed'
            };
            
            // If user is a cashier, filter by their userId
            if (user && user.role === UserRole.CASHIER) {
                whereCondition.userId = user.id;
            }

            // First, get completed sales in the period (filtered by user if cashier)
            const completedSales = await this.saleRepository.find({
                where: whereCondition,
                relations: ['salesItems']
            });

            // Filter by date period
            const filteredSales = completedSales.filter(sale => {
                const saleDate = new Date(sale.createdAt);
                return saleDate >= startDate && saleDate <= now;
            });

            const totalSales = filteredSales.length;
            const totalAmount = filteredSales.reduce((sum, sale) => {
                // Safely convert sale.total to number, handling null, undefined, or string values
                const saleTotal = sale.total;
                let numericTotal = 0;
                
                if (saleTotal !== null && saleTotal !== undefined) {
                    if (typeof saleTotal === 'string') {
                        numericTotal = parseFloat(saleTotal) || 0;
                    } else if (typeof saleTotal === 'number') {
                        numericTotal = isNaN(saleTotal) ? 0 : saleTotal;
                    }
                }
                
                return sum + numericTotal;
            }, 0);
            const averageAmount = totalSales > 0 ? totalAmount / totalSales : 0;

            // Calculate top products - simplified approach
            const productSales: Record<string, { quantity: number; revenue: number }> = {};
            
            filteredSales.forEach(sale => {
                if (sale.salesItems && sale.salesItems.length > 0) {
                    sale.salesItems.forEach(item => {
                        const productName = `Product ${item.productId}`;
                        if (!productSales[productName]) {
                            productSales[productName] = { quantity: 0, revenue: 0 };
                        }
                        
                        // Safely handle quantity
                        const quantity = item.quantity !== null && item.quantity !== undefined ? 
                            (typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0) : 0;
                        
                        // Safely handle total/revenue
                        let revenue = 0;
                        if (item.total !== null && item.total !== undefined) {
                            if (typeof item.total === 'string') {
                                revenue = parseFloat(item.total) || 0;
                            } else if (typeof item.total === 'number') {
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
        } catch (error) {
            console.error('Error in getSummary:', error);
            // Return default values if there's an error
            return {
                totalSales: 0,
                totalAmount: 0,
                averageAmount: 0,
                topProducts: [],
            };
        }
    }
}
