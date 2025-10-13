"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseItemsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const purchaseItems_entity_1 = require("./entities/purchaseItems.entity");
const purchaseItems_controller_1 = require("./purchaseItems.controller");
const purchaseItems_services_1 = require("./purchaseItems.services");
const purchas_module_1 = require("../purchases/purchas.module");
const product_module_1 = require("../product/product.module");
let PurchaseItemsModule = class PurchaseItemsModule {
};
exports.PurchaseItemsModule = PurchaseItemsModule;
exports.PurchaseItemsModule = PurchaseItemsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([purchaseItems_entity_1.PurchaseItems]), purchas_module_1.PurchasModule, product_module_1.ProductsModule],
        controllers: [purchaseItems_controller_1.PurchaseItemsController],
        providers: [purchaseItems_services_1.PurchaseItemsService],
    })
], PurchaseItemsModule);
//# sourceMappingURL=purchaseItems.module.js.map