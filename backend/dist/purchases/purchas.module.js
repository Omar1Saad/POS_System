"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const purchase_entity_1 = require("./entities/purchase.entity");
const purchas_controller_1 = require("./purchas.controller");
const purchas_services_1 = require("./purchas.services");
const supplier_module_1 = require("../suppliers/supplier.module");
let PurchasModule = class PurchasModule {
};
exports.PurchasModule = PurchasModule;
exports.PurchasModule = PurchasModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([purchase_entity_1.Purchase]), supplier_module_1.SupplierModule],
        controllers: [purchas_controller_1.PurchasController],
        providers: [purchas_services_1.PurchaseService],
        exports: [purchas_services_1.PurchaseService]
    })
], PurchasModule);
//# sourceMappingURL=purchas.module.js.map