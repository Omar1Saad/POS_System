import { Injectable, NotFoundException } from "@nestjs/common";
import { In, Repository, Like, MoreThanOrEqual, DataSource } from "typeorm";
import { CreatePurchasesDto } from "./dto/create-purchases.dto";
import { Purchase } from "./entities/purchase.entity";
import { UpdatePurchasesDto } from "./dto/update-purchases.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierService } from "src/suppliers/supplier.services";
import { DataResponse, PaginationResponse } from "../common/types";
import { statusState } from "src/sales/entities/sale.entity";




@Injectable()
export class PurchaseService {
    constructor(
        @InjectRepository(Purchase)
        private readonly purchasesRepository: Repository<Purchase>,
        private readonly supplierService: SupplierService,
        private readonly dataSource: DataSource,
    ){}

    async createPurchase(createPurchasesDto:CreatePurchasesDto, user:any): Promise<{data: Purchase, message: string}> {
        const { supplierId, total, purchaseItems } = createPurchasesDto;
        
        const supplier = await this.supplierService.getSupplierById(supplierId);
        if(!supplier){
            throw new NotFoundException("Supplier not found!")
        }

        const purchase = this.purchasesRepository.create({
            supplierId,
            userId: user.id,
            total: total || 0,
            status: statusState.PENDING
        });
        
        const savedPurchase = await this.purchasesRepository.save(purchase);
        return { data: savedPurchase, message: 'Purchase created successfully' };
    }

    async getPurchases(user: any, paginationResponse: PaginationResponse & {search?: string, status?: string}): Promise<DataResponse<Purchase>> {
        const { page, limit, search, status } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        
        let whereCondition: any = {};
        
        if (status && status !== 'all') {
            whereCondition.status = status;
        }
        
        if (search) {
            whereCondition = [
                { ...whereCondition, id: Like(`%${search}%`) },
                { ...whereCondition, supplier: { name: Like(`%${search}%`) } }
            ];
        }
        
        const [purchases, total] = await this.purchasesRepository.findAndCount({ 
            where: whereCondition,
            relations: ['supplier', 'user', 'purchaseItems'],
            skip, 
            take,
            order: { createdAt: 'DESC' }
        });
        
        return { 
          data: purchases, 
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
    }

    async getPurchaseById(id:number, user: any): Promise<{data: Purchase, message: string}> {
        const purchase = await this.purchasesRepository.findOne({ 
            where: { id },
            relations: ['supplier', 'user', 'purchaseItems', 'purchaseItems.product']
        });
        if(!purchase){
            throw new NotFoundException("Purchase not found!")
        }
        return { data: purchase, message: 'Purchase fetched successfully' };
    }

    async updatePurchase(id:number, updatePurchasesDto:UpdatePurchasesDto, user: any): Promise<{data: Purchase, message: string}> {
        const purchase = await this.purchasesRepository.findOne({ 
            where: { id }
        });
        if(!purchase){
            throw new NotFoundException("Purchase not found!")
        }
        
        const { supplierId, total, purchaseItems } = updatePurchasesDto;
        
        if(supplierId){
            const supplier = await this.supplierService.getSupplierById(supplierId);
            if(!supplier){
                throw new NotFoundException("Supplier not found!")
            }
            purchase.supplierId = supplierId;
        }
        
        if(total !== undefined) {
            purchase.total = total;
        }
        
        purchase.status = updatePurchasesDto.status || purchase.status;
        
        // Save the purchase first (without relations to avoid issues)
        const updatedPurchase = await this.purchasesRepository.save(purchase);
        
        // Handle purchase items update after saving the purchase
        if (purchaseItems && Array.isArray(purchaseItems)) {
            // Delete existing purchase items
            await this.purchasesRepository.manager.delete('purchase_items', { purchaseId: id });
            
            // Create new purchase items if any are provided
            if (purchaseItems.length > 0) {
                const purchaseItemsToCreate = purchaseItems.map(item => ({
                    purchaseId: id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    total: item.quantity * item.unitCost
                }));
                
                await this.purchasesRepository.manager.insert('purchase_items', purchaseItemsToCreate);
            }
        }
        
        // Fetch the updated purchase with relations
        const finalPurchase = await this.purchasesRepository.findOne({
            where: { id },
            relations: ['supplier', 'user', 'purchaseItems', 'purchaseItems.product']
        });
        
        if (!finalPurchase) {
            throw new NotFoundException("Purchase not found after update!");
        }
        
        return { data: finalPurchase, message: 'Purchase updated successfully' };
    }

    async updatePurchaseTotal(id:number, total:number): Promise<Purchase> {
        const purchase = await this.purchasesRepository.findOne({ where: { id } });
        if(!purchase){
            throw new NotFoundException("Purchase not found!")
        }
        if(total < 0) {
            throw new NotFoundException("Total must be greater than or equal to zero!")
        }
        purchase.total = total;
        return this.purchasesRepository.save(purchase);
    }

    async completePurchase(id: number, user: any): Promise<{data: Purchase, message: string}> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const purchase = await queryRunner.manager.findOne(Purchase, { 
                where: { id }, 
                relations: ['purchaseItems', 'purchaseItems.product'] 
            });
            
            if(!purchase){
                throw new NotFoundException("Purchase not found!")
            }
            
            if(purchase.status === statusState.COMPLETED){
                throw new NotFoundException("Purchase is already completed!")
            }
            
            if(purchase.status === statusState.CANCELLED){
                throw new NotFoundException("Cannot complete a cancelled purchase!")
            }
            
            // Update stock and calculate weighted average cost for all items
            for (const item of purchase.purchaseItems) {
                const product = item.product;
                if (product) {
                    // Calculate Weighted Average Cost (WAC)
                    const currentTotalValue = product.stock * product.averageCost;
                    const newPurchaseValue = item.quantity * item.unitCost;
                    const newTotalStock = product.stock + item.quantity;
                    
                    // Calculate new average cost
                    const newAverageCost = newTotalStock > 0 ? 
                        (currentTotalValue + newPurchaseValue) / newTotalStock : 
                        item.unitCost;
                    
                    // Update product with new stock and average cost
                    product.stock = newTotalStock;
                    product.averageCost = newAverageCost;
                    
                    await queryRunner.manager.save(product);
                }
            }
            
            purchase.status = statusState.COMPLETED;
            const updatedPurchase = await queryRunner.manager.save(purchase);
            
            await queryRunner.commitTransaction();
            return { data: updatedPurchase, message: 'Purchase completed successfully' };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async cancelPurchase(id: number, user: any): Promise<{data: Purchase, message: string}> {
        const purchase = await this.purchasesRepository.findOne({ where: { id } });
        
        if(!purchase){
            throw new NotFoundException("Purchase not found!")
        }
        
        if(purchase.status === statusState.COMPLETED){
            throw new NotFoundException("Cannot cancel a completed purchase!")
        }
        
        if(purchase.status === statusState.CANCELLED){
            throw new NotFoundException("Purchase is already cancelled!")
        }
        
        purchase.status = statusState.CANCELLED;
        const updatedPurchase = await this.purchasesRepository.save(purchase);
        
        return { data: updatedPurchase, message: 'Purchase cancelled successfully' };
    }

    async getSummary(period: string = 'month'): Promise<{
        totalPurchases: number;
        totalAmount: number;
        averageAmount: number;
        topSuppliers: Array<{ supplier: string; orders: number; amount: number }>;
    }> {
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
        
        const completedPurchases = await this.purchasesRepository.find({
            where: { 
                status: statusState.COMPLETED,
                createdAt: MoreThanOrEqual(startDate)
            },
            relations: ['supplier']
        });
        
        const totalPurchases = completedPurchases.length;
        const totalAmount = completedPurchases.reduce((sum, purchase) => sum + Number(purchase.total), 0);
        const averageAmount = totalPurchases > 0 ? totalAmount / totalPurchases : 0;
        
        // Calculate top suppliers
        const supplierStats: Record<string, { orders: number; amount: number }> = {};
        
        completedPurchases.forEach(purchase => {
            const supplierName = purchase.supplier?.name || `Supplier ${purchase.supplierId}`;
            if (!supplierStats[supplierName]) {
                supplierStats[supplierName] = { orders: 0, amount: 0 };
            }
            supplierStats[supplierName].orders += 1;
            supplierStats[supplierName].amount += Number(purchase.total);
        });
        
        const topSuppliers = Object.entries(supplierStats)
            .map(([supplier, data]) => ({ supplier, ...data }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
        
        return {
            totalPurchases,
            totalAmount,
            averageAmount,
            topSuppliers,
        };
    }

    async deleteBulk(ids:number[]):Promise<{message: string}>{
        const purchases = await this.purchasesRepository.findBy({ id: In(ids) });
        if(purchases.length !== ids.length){
          throw new NotFoundException("One or more purchase not found!")
        }
        await this.purchasesRepository.delete(ids);
        return { message: 'Purchases deleted successfully!' };
    }

    async delete(id:number, user: any): Promise<{message: string}> {
        const purchase = await this.purchasesRepository.findOne({ where: { id }});
        if(!purchase){
            throw new NotFoundException("Purchase not found!")
        }
        await this.purchasesRepository.delete(id);
        return { message: "Purchase deleted successfully!" };
    }
}
