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
exports.PurchaseItemsController = void 0;
const common_1 = require("@nestjs/common");
const create_purchaseItems_dto_1 = require("./dto/create-purchaseItems.dto");
const update_purchaseItems_dto_1 = require("./dto/update-purchaseItems.dto");
const purchaseItems_services_1 = require("./purchaseItems.services");
const roles_guard_1 = require("../auth/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PurchaseItemsController = class PurchaseItemsController {
    purchaseItemsService;
    constructor(purchaseItemsService) {
        this.purchaseItemsService = purchaseItemsService;
    }
    create(createPurchaseItemsDto) {
        return this.purchaseItemsService.createPurchaseItems(createPurchaseItemsDto);
    }
    findAll(page, limit) {
        return this.purchaseItemsService.getPurchaseItems({ page, limit });
    }
    findOne(id) {
        return this.purchaseItemsService.getPurchaseItemsById(id);
    }
    update(id, updatePurchaseItemsDto) {
        return this.purchaseItemsService.updatePurchaseItems(id, updatePurchaseItemsDto);
    }
    remove(id) {
        return this.purchaseItemsService.delete(id);
    }
    createBulk(createPurchaseItemsDto) {
        return this.purchaseItemsService.createBulkPurchaseItems(createPurchaseItemsDto);
    }
};
exports.PurchaseItemsController = PurchaseItemsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_purchaseItems_dto_1.CreatePurchaseItemsDto]),
    __metadata("design:returntype", void 0)
], PurchaseItemsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PurchaseItemsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PurchaseItemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_purchaseItems_dto_1.UpdatePurchaseItemsDto]),
    __metadata("design:returntype", void 0)
], PurchaseItemsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PurchaseItemsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], PurchaseItemsController.prototype, "createBulk", null);
exports.PurchaseItemsController = PurchaseItemsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER),
    (0, common_1.Controller)('purchase-Items'),
    __metadata("design:paramtypes", [purchaseItems_services_1.PurchaseItemsService])
], PurchaseItemsController);
//# sourceMappingURL=purchaseItems.controller.js.map