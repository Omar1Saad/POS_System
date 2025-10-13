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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const category_services_1 = require("../categories/category.services");
let ProductService = class ProductService {
    productRepository;
    categoryService;
    constructor(productRepository, categoryService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
    }
    calculatePrice(averageCost, profitPercentage = 25) {
        if (!averageCost || averageCost <= 0) {
            return 0;
        }
        const cost = Number(averageCost);
        const percentage = Number(profitPercentage);
        const profitAmount = cost * percentage / 100;
        const calculatedPrice = Math.round((cost + profitAmount) * 100) / 100;
        return calculatedPrice;
    }
    async create(createProductDto) {
        const { name, categoryId } = createProductDto;
        await this.validateCategoryExists(categoryId);
        await this.validateProductNameUnique(name);
        const productData = this.buildProductData(createProductDto);
        const product = this.productRepository.create(productData);
        return this.productRepository.save(product);
    }
    async validateCategoryExists(categoryId) {
        const category = await this.categoryService.getCategoryById(categoryId);
        if (!category) {
            throw new common_1.NotFoundException("Category not found!");
        }
    }
    async validateProductNameUnique(name) {
        const existingProduct = await this.productRepository.findOne({ where: { name } });
        if (existingProduct) {
            throw new common_1.ConflictException('Product with this name already exists');
        }
    }
    buildProductData(createProductDto) {
        const { name, price, categoryId, barcode, stock, profitPercentage, averageCost } = createProductDto;
        const calculatedPrice = averageCost > 0 ? this.calculatePrice(averageCost, profitPercentage) : price;
        return {
            name,
            price: calculatedPrice,
            categoryId,
            barcode,
            stock,
            averageCost: averageCost || 0,
            profitPercentage: profitPercentage || 25.00,
        };
    }
    async getAll(paginationResponse) {
        const { page, limit } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        const [products, total] = await this.productRepository.findAndCount({ skip, take, relations: ['category'] });
        return {
            data: products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getById(id) {
        const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
        if (!product) {
            throw new common_1.NotFoundException("Product not found!");
        }
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findProductById(id);
        await this.validateUpdateData(id, updateProductDto);
        this.updateProductFields(product, updateProductDto);
        this.updateProductPricing(product, updateProductDto);
        return this.productRepository.save(product);
    }
    async findProductById(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException("Product not found!");
        }
        return product;
    }
    async validateUpdateData(id, updateProductDto) {
        const { name, barcode, categoryId } = updateProductDto;
        if (categoryId) {
            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) {
                throw new common_1.NotFoundException("Category not found!");
            }
        }
        if (name) {
            const existingProduct = await this.productRepository.findOne({ where: { name } });
            if (existingProduct && existingProduct.id !== +id) {
                throw new common_1.ConflictException('Product with this name already exists');
            }
        }
        if (barcode) {
            const existingProduct = await this.productRepository.findOne({ where: { barcode } });
            if (existingProduct && existingProduct.id !== +id) {
                throw new common_1.ConflictException('Product with this barcode already exists');
            }
        }
    }
    updateProductFields(product, updateProductDto) {
        const { name, barcode, stock, categoryId } = updateProductDto;
        if (name)
            product.name = name;
        if (barcode)
            product.barcode = barcode;
        if (categoryId)
            product.categoryId = categoryId;
        if (stock === 0) {
            product.stock = 0;
        }
        else if (stock !== undefined) {
            product.stock = stock;
        }
    }
    updateProductPricing(product, updateProductDto) {
        const { price, averageCost, profitPercentage } = updateProductDto;
        if (averageCost !== undefined) {
            product.averageCost = averageCost;
        }
        if (profitPercentage !== undefined) {
            product.profitPercentage = profitPercentage;
        }
        const currentAverageCost = averageCost !== undefined ? averageCost : product.averageCost;
        const currentProfitPercentage = profitPercentage !== undefined ? profitPercentage : product.profitPercentage;
        if (currentAverageCost > 0) {
            product.price = this.calculatePrice(currentAverageCost, currentProfitPercentage);
        }
        else if (price !== undefined) {
            product.price = price;
        }
    }
    async delete(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException("Product not found!");
        }
        await this.productRepository.delete(id);
        return { 'message': 'Product deleted successfully!' };
    }
    async deleteBulk(ids) {
        const products = await this.productRepository.findBy({ id: (0, typeorm_2.In)(ids) });
        if (products.length !== ids.length) {
            throw new common_1.NotFoundException("One or more products not found!");
        }
        await this.productRepository.delete(ids);
        return { 'message': 'Products deleted successfully!' };
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Products)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        category_services_1.CategoryService])
], ProductService);
//# sourceMappingURL=product.services.js.map