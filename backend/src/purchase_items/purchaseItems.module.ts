import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PurchaseItems } from "./entities/purchaseItems.entity";
import { PurchaseItemsController } from "./purchaseItems.controller";
import { PurchaseItemsService } from "./purchaseItems.services";
import { PurchasModule } from "src/purchases/purchas.module";
import { ProductsModule } from "src/product/product.module";



@Module({
    imports: [TypeOrmModule.forFeature([PurchaseItems]), PurchasModule, ProductsModule],
    controllers: [PurchaseItemsController],
    providers: [PurchaseItemsService],
})
export class PurchaseItemsModule {}