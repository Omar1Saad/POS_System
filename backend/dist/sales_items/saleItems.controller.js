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
exports.SaleItemsController = void 0;
const common_1 = require("@nestjs/common");
const create_salesItems_dto_1 = require("./dto/create-salesItems.dto");
const update_salesItems_dto_1 = require("./dto/update-salesItems.dto");
const saleItems_services_1 = require("./saleItems.services");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SaleItemsController = class SaleItemsController {
    saleService;
    constructor(saleService) {
        this.saleService = saleService;
    }
    create(createSaleDto) {
        return this.saleService.createSaleItems(createSaleDto);
    }
    bulkCreate(createSaleDto) {
        return this.saleService.BulkCreateSaleItems(createSaleDto);
    }
    findAll(req, page, limit) {
        const user = req.user;
        return this.saleService.getSaleItems(user, { page, limit });
    }
    findOne(id, req) {
        const user = req.user;
        return this.saleService.getSaleItemsById(id, user);
    }
    update(id, updateSaleDto, req) {
        const user = req.user;
        return this.saleService.updateSaleItems(id, updateSaleDto, user);
    }
    remove(id, req) {
        const user = req.user;
        return this.saleService.delete(id, user);
    }
    removeBySaleId(saleId, req) {
        return this.saleService.deleteBySaleId(saleId);
    }
};
exports.SaleItemsController = SaleItemsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_salesItems_dto_1.CreateSalesItemsDto]),
    __metadata("design:returntype", void 0)
], SaleItemsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], SaleItemsController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", void 0)
], SaleItemsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SaleItemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_salesItems_dto_1.UpdateSalesItemsDto, Object]),
    __metadata("design:returntype", void 0)
], SaleItemsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SaleItemsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('sale/:saleId'),
    __param(0, (0, common_1.Param)('saleId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SaleItemsController.prototype, "removeBySaleId", null);
exports.SaleItemsController = SaleItemsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sales-items'),
    __metadata("design:paramtypes", [saleItems_services_1.SaleItemsService])
], SaleItemsController);
//# sourceMappingURL=saleItems.controller.js.map