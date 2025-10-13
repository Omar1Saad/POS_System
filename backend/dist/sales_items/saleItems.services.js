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
exports.SaleItemsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const salesItems_entity_1 = require("./entities/salesItems.entity");
const typeorm_2 = require("@nestjs/typeorm");
const product_services_1 = require("../product/product.services");
const sale_services_1 = require("../sales/sale.services");
const user_entity_1 = require("../users/entities/user.entity");
let SaleItemsService = class SaleItemsService {
    sItemsRepository;
    saleService;
    productService;
    dataSource;
    constructor(sItemsRepository, saleService, productService, dataSource) {
        this.sItemsRepository = sItemsRepository;
        this.saleService = saleService;
        this.productService = productService;
        this.dataSource = dataSource;
    }
    async createSaleItems(createSalesItemsDto) {
        const { productId, quantity, saleId } = createSalesItemsDto;
        const sale = await this.saleService.getSaleById(saleId);
        const saleItemsExists = await this.sItemsRepository.findOne({ where: { saleId, productId } });
        if (saleItemsExists) {
            throw new common_1.NotFoundException("This product is already added to the sale!");
        }
        if (!sale) {
            throw new common_1.NotFoundException("Sale not found!");
        }
        if (sale.status === 'completed') {
            throw new common_1.NotFoundException("Cannot add items to a completed sale!");
        }
        const product = await this.productService.getById(productId);
        if (!product) {
            throw new common_1.NotFoundException("Product not found!");
        }
        if (quantity <= 0) {
            throw new common_1.NotFoundException(`Invalid quantity for product "${product.name}". Quantity must be greater than zero, but you entered: ${quantity}.`);
        }
        if (quantity > product.stock) {
            throw new common_1.NotFoundException(`Insufficient stock for product "${product.name}". Available stock: ${product.stock}, but you requested: ${quantity}. Please reduce the quantity or choose a different product.`);
        }
        const unitPrice = +product.price;
        const costAtTimeOfSale = +product.averageCost;
        let total = unitPrice * quantity;
        await this.saleService.updateSaleTotal(saleId, +sale.total + total);
        const saleItems = this.sItemsRepository.create({
            total,
            productId,
            quantity,
            saleId,
            unitPrice,
            costAtTimeOfSale,
        });
        return this.sItemsRepository.save(saleItems);
    }
    async BulkCreateSaleItems(createSalesItemsDto) {
        if (!createSalesItemsDto || !Array.isArray(createSalesItemsDto)) {
            throw new common_1.NotFoundException("Invalid sale items data provided");
        }
        if (createSalesItemsDto.length === 0) {
            return [];
        }
        const saleId = createSalesItemsDto[0].saleId;
        await this.deleteBySaleId(saleId);
        await this.saleService.updateSaleTotal(saleId, 0);
        const salesItems = [];
        let newSaleTotal = 0;
        for (const item of createSalesItemsDto) {
            const { productId, quantity } = item;
            const product = await this.productService.getById(productId);
            if (!product) {
                throw new common_1.NotFoundException("One of the products not found!");
            }
            if (quantity <= 0) {
                throw new common_1.NotFoundException(`Invalid quantity for product "${product.name}". Quantity must be greater than zero, but you entered: ${quantity}.`);
            }
            if (quantity > product.stock) {
                throw new common_1.NotFoundException(`Insufficient stock for product "${product.name}". Available stock: ${product.stock}, but you requested: ${quantity}. Please reduce the quantity or choose a different product.`);
            }
            const unitPrice = +product.price;
            const costAtTimeOfSale = +product.averageCost;
            let total = unitPrice * quantity;
            newSaleTotal += total;
            const saleItems = this.sItemsRepository.create({
                total,
                productId,
                quantity,
                saleId,
                unitPrice,
                costAtTimeOfSale,
            });
            salesItems.push(saleItems);
        }
        await this.saleService.updateSaleTotal(saleId, newSaleTotal);
        return this.sItemsRepository.save(salesItems);
    }
    async getSaleItems(user, paginationResponse) {
        const where = {};
        if (user.role === user_entity_1.UserRole.CASHIER) {
            where.sale = { userId: user.id };
        }
        const { page, limit } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        const [saleItems, total] = await this.sItemsRepository.findAndCount({ where, skip, take });
        return {
            data: saleItems,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getSaleItemsById(id, user) {
        const findSaleItems = async () => {
            if (user.role === user_entity_1.UserRole.CASHIER) {
                return await this.sItemsRepository.findOne({ where: { id, sale: { userId: user.id } } });
            }
            else {
                return await this.sItemsRepository.findOne({ where: { id } });
            }
        };
        const saleItems = await findSaleItems();
        if (!saleItems) {
            throw new common_1.NotFoundException("Sale Items not found!");
        }
        return saleItems;
    }
    async updateSaleItems(id, updateSaleItemsDto, user) {
        const findSaleItems = async () => {
            if (user.role === user_entity_1.UserRole.CASHIER) {
                return await this.sItemsRepository.findOne({ where: { id, sale: { userId: user.id } }, relations: ['sale'] });
            }
            else {
                return await this.sItemsRepository.findOne({ where: { id }, relations: ['sale'] });
            }
        };
        const saleItems = await findSaleItems();
        if (!saleItems) {
            throw new common_1.NotFoundException("Sale Items not found!");
        }
        if (saleItems.sale.status === 'completed') {
            throw new common_1.NotFoundException("Cannot update items from a completed sale!");
        }
        const { quantity } = updateSaleItemsDto;
        if (!quantity) {
            return saleItems;
        }
        const product = await this.productService.getById(saleItems.productId);
        if (quantity <= 0) {
            throw new common_1.NotFoundException("Quantity must be greater than zero!");
        }
        if (quantity > product.stock + saleItems.quantity) {
            throw new common_1.NotFoundException("Insufficient stock!");
        }
        const newTotal = quantity * saleItems.unitPrice;
        const sale = await this.saleService.getSaleById(saleItems.saleId);
        const total = +sale.total - +saleItems.total + newTotal;
        await this.saleService.updateSaleTotal(saleItems.saleId, total);
        saleItems.total = newTotal;
        saleItems.quantity = quantity;
        return this.sItemsRepository.save(saleItems);
    }
    async delete(id, user) {
        const findSaleItems = async () => {
            if (user.role === user_entity_1.UserRole.CASHIER) {
                return await this.sItemsRepository.findOne({ where: { id, sale: { userId: user.id } }, relations: ['sale'] });
            }
            else {
                return await this.sItemsRepository.findOne({ where: { id }, relations: ['sale'] });
            }
        };
        const saleItems = await findSaleItems();
        if (!saleItems) {
            throw new common_1.NotFoundException("Sale Items not found!");
        }
        if (saleItems.sale.status === 'completed') {
            throw new common_1.NotFoundException("Cannot delete items from a completed sale!");
        }
        const oldTotal = saleItems.unitPrice * saleItems.quantity;
        const sale = await this.saleService.getSaleById(saleItems.saleId);
        await this.saleService.updateSaleTotal(saleItems.saleId, +sale.total - oldTotal);
        await this.sItemsRepository.delete(id);
        return { "success": "Sale Items deleted successfully!" };
    }
    async deleteBySaleId(saleId) {
        await this.sItemsRepository.delete({ saleId });
    }
};
exports.SaleItemsService = SaleItemsService;
exports.SaleItemsService = SaleItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(salesItems_entity_1.SalesItems)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        sale_services_1.SaleService,
        product_services_1.ProductService,
        typeorm_1.DataSource])
], SaleItemsService);
//# sourceMappingURL=saleItems.services.js.map