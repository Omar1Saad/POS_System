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
exports.PurchaseItemsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const purchaseItems_entity_1 = require("./entities/purchaseItems.entity");
const typeorm_2 = require("@nestjs/typeorm");
const product_services_1 = require("../product/product.services");
const purchas_services_1 = require("../purchases/purchas.services");
let PurchaseItemsService = class PurchaseItemsService {
    pItemsRepository;
    productService;
    purchaseService;
    constructor(pItemsRepository, productService, purchaseService) {
        this.pItemsRepository = pItemsRepository;
        this.productService = productService;
        this.purchaseService = purchaseService;
    }
    async createPurchaseItems(createPurchaseItemsDto) {
        const { productId, quantity, purchaseId, unitCost } = createPurchaseItemsDto;
        const purchaseItemsExists = await this.pItemsRepository.findOne({ where: { purchaseId, productId } });
        if (purchaseItemsExists) {
            throw new common_1.NotFoundException("This product is already added to the purchase!");
        }
        const purchase = await this.purchaseService.getPurchaseById(purchaseId, null);
        if (!purchase) {
            throw new common_1.NotFoundException("Purchase not found!");
        }
        if (purchase.data.status === 'completed') {
            throw new common_1.NotFoundException("Cannot add items to a completed purchase!");
        }
        const product = await this.productService.getById(productId);
        if (!product) {
            throw new common_1.NotFoundException("Product not found!");
        }
        if (quantity <= 0) {
            throw new common_1.NotFoundException("Quantity must be greater than zero!");
        }
        if (unitCost <= 0) {
            throw new common_1.NotFoundException("Unit cost must be greater than zero!");
        }
        let total = unitCost * quantity;
        await this.purchaseService.updatePurchaseTotal(purchaseId, +total);
        const purchaseItems = this.pItemsRepository.create({
            total,
            productId,
            quantity,
            purchaseId,
            unitCost
        });
        return this.pItemsRepository.save(purchaseItems);
    }
    async getPurchaseItems(paginationResponse) {
        const { page, limit } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        const [purchaseItems, total] = await this.pItemsRepository.findAndCount({ skip, take });
        return {
            data: purchaseItems,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getPurchaseItemsById(id) {
        const purchaseItems = await this.pItemsRepository.findOne({ where: { id } });
        if (!purchaseItems) {
            throw new common_1.NotFoundException("Purchase Items not found!");
        }
        return purchaseItems;
    }
    async updatePurchaseItems(id, updatePurchaseItemsDto) {
        const purchaseItems = await this.pItemsRepository.findOne({ where: { id }, relations: ['purchase'] });
        if (!purchaseItems) {
            throw new common_1.NotFoundException("Purchase Items not found!");
        }
        if (purchaseItems.purchase.status === 'completed') {
            throw new common_1.NotFoundException("Cannot update items from a completed purchase!");
        }
        const { quantity, unitCost } = updatePurchaseItemsDto;
        let newQuantity = quantity ?? purchaseItems.quantity;
        let newUnitCost = unitCost ?? purchaseItems.unitCost;
        let newTotal = newQuantity * newUnitCost;
        await this.purchaseService.updatePurchaseTotal(purchaseItems.purchaseId, (+purchaseItems.purchase.total - purchaseItems.total) + newTotal);
        purchaseItems.total = newTotal;
        purchaseItems.quantity = newQuantity;
        purchaseItems.unitCost = newUnitCost;
        return this.pItemsRepository.save(purchaseItems);
    }
    async delete(id) {
        const purchaseItems = await this.pItemsRepository.findOne({ where: { id }, relations: ['purchase'] });
        if (!purchaseItems) {
            throw new common_1.NotFoundException("Purchase Items not found!");
        }
        if (purchaseItems.purchase.status === 'completed') {
            throw new common_1.NotFoundException("Cannot delete items from a completed purchase!");
        }
        await this.purchaseService.updatePurchaseTotal(purchaseItems.purchaseId, +purchaseItems.purchase.total - purchaseItems.total);
        await this.pItemsRepository.delete(id);
        return { "success": "Purchase Items deleted successfully!" };
    }
    async createBulkPurchaseItems(createPurchaseItemsDto) {
        const purchaseItems = [];
        let totalAmount = 0;
        for (const itemDto of createPurchaseItemsDto) {
            const { productId, quantity, purchaseId, unitCost } = itemDto;
            const existingItem = await this.pItemsRepository.findOne({
                where: { purchaseId, productId }
            });
            if (existingItem) {
                throw new common_1.NotFoundException(`Product ${productId} is already added to purchase ${purchaseId}!`);
            }
            const purchase = await this.purchaseService.getPurchaseById(purchaseId, null);
            if (!purchase) {
                throw new common_1.NotFoundException("Purchase not found!");
            }
            if (purchase.data.status === 'completed') {
                throw new common_1.NotFoundException("Cannot add items to a completed purchase!");
            }
            const product = await this.productService.getById(productId);
            if (!product) {
                throw new common_1.NotFoundException("Product not found!");
            }
            if (quantity <= 0) {
                throw new common_1.NotFoundException("Quantity must be greater than zero!");
            }
            if (unitCost <= 0) {
                throw new common_1.NotFoundException("Unit cost must be greater than zero!");
            }
            const total = unitCost * quantity;
            totalAmount += total;
            const purchaseItem = this.pItemsRepository.create({
                total,
                productId,
                quantity,
                purchaseId,
                unitCost
            });
            purchaseItems.push(purchaseItem);
        }
        const savedItems = await this.pItemsRepository.save(purchaseItems);
        if (savedItems.length > 0) {
            const purchase = await this.purchaseService.getPurchaseById(savedItems[0].purchaseId, null);
            if (purchase) {
                await this.purchaseService.updatePurchaseTotal(savedItems[0].purchaseId, purchase.data.total + totalAmount);
            }
        }
        return { data: savedItems, message: 'Purchase items created successfully' };
    }
};
exports.PurchaseItemsService = PurchaseItemsService;
exports.PurchaseItemsService = PurchaseItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(purchaseItems_entity_1.PurchaseItems)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        product_services_1.ProductService,
        purchas_services_1.PurchaseService])
], PurchaseItemsService);
//# sourceMappingURL=purchaseItems.services.js.map