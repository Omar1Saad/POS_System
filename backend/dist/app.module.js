"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const config_1 = require("@nestjs/config");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("./users/user.module");
const product_module_1 = require("./product/product.module");
const category_module_1 = require("./categories/category.module");
const purchas_module_1 = require("./purchases/purchas.module");
const saleItems_module_1 = require("./sales_items/saleItems.module");
const sale_module_1 = require("./sales/sale.module");
const customer_module_1 = require("./customers/customer.module");
const supplier_module_1 = require("./suppliers/supplier.module");
const purchaseItems_module_1 = require("./purchase_items/purchaseItems.module");
const auth_module_1 = require("./auth/auth.module");
const analytics_module_1 = require("./analytics/analytics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    url: configService.get('DATABASE_URL'),
                    autoLoadEntities: true,
                    synchronize: false,
                    ssl: {
                        rejectUnauthorized: false,
                    }
                }),
            }),
            user_module_1.UserModule,
            category_module_1.CategoryModule,
            customer_module_1.CustomerModule,
            product_module_1.ProductsModule,
            supplier_module_1.SupplierModule,
            sale_module_1.SaleModule,
            saleItems_module_1.SaleItemsModule,
            purchas_module_1.PurchasModule,
            purchaseItems_module_1.PurchaseItemsModule,
            auth_module_1.AuthModule,
            analytics_module_1.AnalyticsModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map