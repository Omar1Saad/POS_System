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
exports.SupplierService = void 0;
const typeorm_1 = require("typeorm");
const supplier_entity_1 = require("./entities/supplier.entity");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
let SupplierService = class SupplierService {
    supplierRepository;
    constructor(supplierRepository) {
        this.supplierRepository = supplierRepository;
    }
    async createSupplier(createSupplierDto) {
        const { name, phone, email, address } = createSupplierDto;
        const supplierExists = await this.supplierRepository.findOne({ where: { phone } });
        if (supplierExists) {
            throw new common_1.BadRequestException('Phone already exists');
        }
        const emailExists = await this.supplierRepository.findOne({ where: { email } });
        if (emailExists) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const supplier = this.supplierRepository.create({
            name,
            phone,
            email,
            address,
        });
        return this.supplierRepository.save(supplier);
    }
    async getSuppliers(paginationResponse) {
        const { page, limit } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        const [supplieres, total] = await this.supplierRepository.findAndCount({ skip, take });
        return {
            data: supplieres,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getSupplierById(id) {
        const supplier = await this.supplierRepository.findOne({ where: { id } });
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        return supplier;
    }
    async updateSupplier(id, updateSupplierDto) {
        const { name, phone, email, address } = updateSupplierDto;
        const supplierExists = await this.supplierRepository.findOne({ where: { phone } });
        if (supplierExists && supplierExists.id != id) {
            throw new common_1.BadRequestException('Phone already exists');
        }
        const emailExists = await this.supplierRepository.findOne({ where: { email } });
        if (emailExists && emailExists.id != id) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const supplier = await this.getSupplierById(id);
        supplier.name = name || supplier.name;
        supplier.phone = phone || supplier.phone;
        supplier.email = email || supplier.email;
        supplier.address = address || supplier.address;
        return this.supplierRepository.save(supplier);
    }
    async deleteBulk(ids) {
        const products = await this.supplierRepository.findBy({ id: (0, typeorm_1.In)(ids) });
        if (products.length !== ids.length) {
            throw new common_1.NotFoundException("One Or More Product not found!");
        }
        await this.supplierRepository.delete(ids);
        return { 'message': 'Deleted Product was Successfully!' };
    }
    async delete(id) {
        const supplierExists = await this.supplierRepository.findOne({ where: { id } });
        if (!supplierExists) {
            throw new common_1.NotFoundException('Supplier Not Found!');
        }
        await this.supplierRepository.delete(id);
        return { "success": "Supplier was Deleted Successfully!" };
    }
};
exports.SupplierService = SupplierService;
exports.SupplierService = SupplierService = __decorate([
    __param(0, (0, typeorm_2.InjectRepository)(supplier_entity_1.Supplier)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], SupplierService);
//# sourceMappingURL=supplier.services.js.map