import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sale } from "./entities/sale.entity";
import { SaleController } from "./sale.controller";
import { SaleService } from "./sale.services";
import { CustomerModule } from "src/customers/customer.module";

@Module({
    imports: [TypeOrmModule.forFeature([Sale]), CustomerModule],
    controllers: [SaleController],
    providers: [SaleService],
    exports:[SaleService]
})
export class SaleModule {}