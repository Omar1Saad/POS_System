import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SalesItems } from "./entities/salesItems.entity";
import { SaleItemsController } from "./saleItems.controller";
import { SaleItemsService } from "./saleItems.services";
import { SaleModule } from "src/sales/sale.module";
import { ProductsModule } from "src/product/product.module";



@Module({
    imports: [TypeOrmModule.forFeature([SalesItems]), SaleModule, ProductsModule],
    controllers: [SaleItemsController],
    providers: [SaleItemsService],
})
export class SaleItemsModule {}