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
exports.CategoryService = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
let CategoryService = class CategoryService {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async createCategory(createCategoryDto) {
        const { name, description } = createCategoryDto;
        const categoryExists = await this.categoryRepository.findOne({ where: { name } });
        if (categoryExists) {
            throw new common_1.BadRequestException('Name already exists');
        }
        const user = this.categoryRepository.create({
            name,
            description,
        });
        return this.categoryRepository.save(user);
    }
    async getCategories(paginationResponse) {
        const { page, limit } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        const [categories, total] = await this.categoryRepository.findAndCount({ skip, take });
        return {
            data: categories,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getCategoryById(id) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async updateCategory(id, updateCategoryDto) {
        const { name, description } = updateCategoryDto;
        const categoryExists = await this.categoryRepository.findOne({ where: { name } });
        if (categoryExists && categoryExists.id !== +id) {
            throw new common_1.BadRequestException('Category Name already exists');
        }
        const category = await this.getCategoryById(id);
        category.name = name ?? category.name;
        category.description = description ?? category.description;
        return this.categoryRepository.save(category);
    }
    async delete(id) {
        const userExists = await this.categoryRepository.findOne({ where: { id } });
        if (!userExists) {
            throw new common_1.NotFoundException('Category Not Found!');
        }
        await this.categoryRepository.delete(id);
        return { "success": "User was Deleted Successfully!" };
    }
    async deleteBulk(ids) {
        const products = await this.categoryRepository.findBy({ id: (0, typeorm_1.In)(ids) });
        if (products.length !== ids.length) {
            throw new common_1.NotFoundException("One Or More Product not found!");
        }
        await this.categoryRepository.delete(ids);
        return { 'message': 'Deleted Product was Successfully!' };
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    __param(0, (0, typeorm_2.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], CategoryService);
//# sourceMappingURL=category.services.js.map