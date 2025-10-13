import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Purchase } from "./entities/purchase.entity";
import { PurchasController } from "./purchas.controller";
import { PurchaseService } from "./purchas.services";
import { SupplierModule } from "src/suppliers/supplier.module";



@Module({
    imports: [TypeOrmModule.forFeature([Purchase]), SupplierModule],
    controllers: [PurchasController],
    providers: [PurchaseService],
    exports: [PurchaseService]
})
export class PurchasModule {}