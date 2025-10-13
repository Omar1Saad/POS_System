"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleItemsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const salesItems_entity_1 = require("./entities/salesItems.entity");
const saleItems_controller_1 = require("./saleItems.controller");
const saleItems_services_1 = require("./saleItems.services");
const sale_module_1 = require("../sales/sale.module");
const product_module_1 = require("../product/product.module");
let SaleItemsModule = class SaleItemsModule {
};
exports.SaleItemsModule = SaleItemsModule;
exports.SaleItemsModule = SaleItemsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([salesItems_entity_1.SalesItems]), sale_module_1.SaleModule, product_module_1.ProductsModule],
        controllers: [saleItems_controller_1.SaleItemsController],
        providers: [saleItems_services_1.SaleItemsService],
    })
], SaleItemsModule);
//# sourceMappingURL=saleItems.module.js.map