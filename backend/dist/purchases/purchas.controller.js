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
exports.PurchasController = void 0;
const common_1 = require("@nestjs/common");
const create_purchases_dto_1 = require("./dto/create-purchases.dto");
const update_purchases_dto_1 = require("./dto/update-purchases.dto");
const purchas_services_1 = require("./purchas.services");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PurchasController = class PurchasController {
    purchaseService;
    constructor(purchaseService) {
        this.purchaseService = purchaseService;
    }
    create(createPurchasesDto, req) {
        const user = req.user;
        return this.purchaseService.createPurchase(createPurchasesDto, user);
    }
    findAll(req, page, limit, search, status) {
        const user = req.user;
        return this.purchaseService.getPurchases(user, { page, limit, search, status });
    }
    getSummary(period = 'month') {
        return this.purchaseService.getSummary(period);
    }
    findOne(id, req) {
        const user = req.user;
        return this.purchaseService.getPurchaseById(id, user);
    }
    update(id, updatePurchaseesDto, req) {
        const user = req.user;
        return this.purchaseService.updatePurchase(id, updatePurchaseesDto, user);
    }
    async deleteBulk(ids) {
        return this.purchaseService.deleteBulk(ids);
    }
    remove(id, req) {
        const user = req.user;
        return this.purchaseService.delete(id, user);
    }
    complete(id, req) {
        const user = req.user;
        return this.purchaseService.completePurchase(id, user);
    }
    cancel(id, req) {
        const user = req.user;
        return this.purchaseService.cancelPurchase(id, user);
    }
};
exports.PurchasController = PurchasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_purchases_dto_1.CreatePurchasesDto, Object]),
    __metadata("design:returntype", void 0)
], PurchasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", void 0)
], PurchasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PurchasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_purchases_dto_1.UpdatePurchasesDto, Object]),
    __metadata("design:returntype", void 0)
], PurchasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('/bulk'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], PurchasController.prototype, "deleteBulk", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PurchasController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PurchasController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PurchasController.prototype, "cancel", null);
exports.PurchasController = PurchasController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('purchases'),
    __metadata("design:paramtypes", [purchas_services_1.PurchaseService])
], PurchasController);
//# sourceMappingURL=purchas.controller.js.map