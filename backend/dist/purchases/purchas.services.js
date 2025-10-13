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
exports.PurchaseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const purchase_entity_1 = require("./entities/purchase.entity");
const typeorm_2 = require("@nestjs/typeorm");
const supplier_services_1 = require("../suppliers/supplier.services");
const sale_entity_1 = require("../sales/entities/sale.entity");
let PurchaseService = class PurchaseService {
    purchasesRepository;
    supplierService;
    dataSource;
    constructor(purchasesRepository, supplierService, dataSource) {
        this.purchasesRepository = purchasesRepository;
        this.supplierService = supplierService;
        this.dataSource = dataSource;
    }
    async createPurchase(createPurchasesDto, user) {
        const { supplierId, total, purchaseItems } = createPurchasesDto;
        const supplier = await this.supplierService.getSupplierById(supplierId);
        if (!supplier) {
            throw new common_1.NotFoundException("Supplier not found!");
        }
        const purchase = this.purchasesRepository.create({
            supplierId,
            userId: user.id,
            total: total || 0,
            status: sale_entity_1.statusState.PENDING
        });
        const savedPurchase = await this.purchasesRepository.save(purchase);
        return { data: savedPurchase, message: 'Purchase created successfully' };
    }
    async getPurchases(user, paginationResponse) {
        const { page, limit, search, status } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        let whereCondition = {};
        if (status && status !== 'all') {
            whereCondition.status = status;
        }
        if (search) {
            whereCondition = [
                { ...whereCondition, id: (0, typeorm_1.Like)(`%${search}%`) },
                { ...whereCondition, supplier: { name: (0, typeorm_1.Like)(`%${search}%`) } }
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
    async getPurchaseById(id, user) {
        const purchase = await this.purchasesRepository.findOne({
            where: { id },
            relations: ['supplier', 'user', 'purchaseItems', 'purchaseItems.product']
        });
        if (!purchase) {
            throw new common_1.NotFoundException("Purchase not found!");
        }
        return { data: purchase, message: 'Purchase fetched successfully' };
    }
    async updatePurchase(id, updatePurchasesDto, user) {
        const purchase = await this.purchasesRepository.findOne({
            where: { id }
        });
        if (!purchase) {
            throw new common_1.NotFoundException("Purchase not found!");
        }
        const { supplierId, total, purchaseItems } = updatePurchasesDto;
        if (supplierId) {
            const supplier = await this.supplierService.getSupplierById(supplierId);
            if (!supplier) {
                throw new common_1.NotFoundException("Supplier not found!");
            }
            purchase.supplierId = supplierId;
        }
        if (total !== undefined) {
            purchase.total = total;
        }
        purchase.status = updatePurchasesDto.status || purchase.status;
        const updatedPurchase = await this.purchasesRepository.save(purchase);
        if (purchaseItems && Array.isArray(purchaseItems)) {
            await this.purchasesRepository.manager.delete('purchase_items', { purchaseId: id });
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
        const finalPurchase = await this.purchasesRepository.findOne({
            where: { id },
            relations: ['supplier', 'user', 'purchaseItems', 'purchaseItems.product']
        });
        if (!finalPurchase) {
            throw new common_1.NotFoundException("Purchase not found after update!");
        }
        return { data: finalPurchase, message: 'Purchase updated successfully' };
    }
    async updatePurchaseTotal(id, total) {
        const purchase = await this.purchasesRepository.findOne({ where: { id } });
        if (!purchase) {
            throw new common_1.NotFoundException("Purchase not found!");
        }
        if (total < 0) {
            throw new common_1.NotFoundException("Total must be greater than or equal to zero!");
        }
        purchase.total = total;
        return this.purchasesRepository.save(purchase);
    }
    async completePurchase(id, user) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const purchase = await queryRunner.manager.findOne(purchase_entity_1.Purchase, {
                where: { id },
                relations: ['purchaseItems', 'purchaseItems.product']
            });
            if (!purchase) {
                throw new common_1.NotFoundException("Purchase not found!");
            }
            if (purchase.status === sale_entity_1.statusState.COMPLETED) {
                throw new common_1.NotFoundException("Purchase is already completed!");
            }
            if (purchase.status === sale_entity_1.statusState.CANCELLED) {
                throw new common_1.NotFoundException("Cannot complete a cancelled purchase!");
            }
            for (const item of purchase.purchaseItems) {
                const product = item.product;
                if (product) {
                    const currentTotalValue = product.stock * product.averageCost;
                    const newPurchaseValue = item.quantity * item.unitCost;
                    const newTotalStock = product.stock + item.quantity;
                    const newAverageCost = newTotalStock > 0 ?
                        (currentTotalValue + newPurchaseValue) / newTotalStock :
                        item.unitCost;
                    product.stock = newTotalStock;
                    product.averageCost = newAverageCost;
                    await queryRunner.manager.save(product);
                }
            }
            purchase.status = sale_entity_1.statusState.COMPLETED;
            const updatedPurchase = await queryRunner.manager.save(purchase);
            await queryRunner.commitTransaction();
            return { data: updatedPurchase, message: 'Purchase completed successfully' };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async cancelPurchase(id, user) {
        const purchase = await this.purchasesRepository.findOne({ where: { id } });
        if (!purchase) {
            throw new common_1.NotFoundException("Purchase not found!");
        }
        if (purchase.status === sale_entity_1.statusState.COMPLETED) {
            throw new common_1.NotFoundException("Cannot cancel a completed purchase!");
        }
        if (purchase.status === sale_entity_1.statusState.CANCELLED) {
            throw new common_1.NotFoundException("Purchase is already cancelled!");
        }
        purchase.status = sale_entity_1.statusState.CANCELLED;
        const updatedPurchase = await this.purchasesRepository.save(purchase);
        return { data: updatedPurchase, message: 'Purchase cancelled successfully' };
    }
    async getSummary(period = 'month') {
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
                status: sale_entity_1.statusState.COMPLETED,
                createdAt: (0, typeorm_1.MoreThanOrEqual)(startDate)
            },
            relations: ['supplier']
        });
        const totalPurchases = completedPurchases.length;
        const totalAmount = completedPurchases.reduce((sum, purchase) => sum + Number(purchase.total), 0);
        const averageAmount = totalPurchases > 0 ? totalAmount / totalPurchases : 0;
        const supplierStats = {};
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
    async deleteBulk(ids) {
        const purchases = await this.purchasesRepository.findBy({ id: (0, typeorm_1.In)(ids) });
        if (purchases.length !== ids.length) {
            throw new common_1.NotFoundException("One or more purchase not found!");
        }
        await this.purchasesRepository.delete(ids);
        return { message: 'Purchases deleted successfully!' };
    }
    async delete(id, user) {
        const purchase = await this.purchasesRepository.findOne({ where: { id } });
        if (!purchase) {
            throw new common_1.NotFoundException("Purchase not found!");
        }
        await this.purchasesRepository.delete(id);
        return { message: "Purchase deleted successfully!" };
    }
};
exports.PurchaseService = PurchaseService;
exports.PurchaseService = PurchaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(purchase_entity_1.Purchase)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        supplier_services_1.SupplierService,
        typeorm_1.DataSource])
], PurchaseService);
//# sourceMappingURL=purchas.services.js.map