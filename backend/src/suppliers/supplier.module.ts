import { Module } from "@nestjs/common";
import { SupplierController } from "./supplier.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Supplier } from "./entities/supplier.entity";
import { SupplierService } from "./supplier.services";



@Module({ 
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports:[SupplierService]
})
export class SupplierModule {}