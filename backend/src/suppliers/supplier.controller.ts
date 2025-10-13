import { RolesGuard } from "src/auth/guards/roles.guard";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { Supplier } from "./entities/supplier.entity";
import { SupplierService } from "./supplier.services";
import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserRole } from "src/users/entities/user.entity";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  createUser(@Body() createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return this.supplierService.createSupplier(createSupplierDto);
  }

  @Get()
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page:number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit:number,   
  ) {
    return this.supplierService.getSuppliers({page, limit});
  }

  @Get(':id')
  getUserById(@Param('id') id: number): Promise<Supplier> {
    return this.supplierService.getSupplierById(id);
  }

  @Patch(':id')
  updateUser(@Param('id') id: number, @Body() updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    return this.supplierService.updateSupplier(id, updateSupplierDto);
  }

  @Delete('/bulk')
  async deleteBulk(@Body('ids') ids:number[]){
      return this.supplierService.deleteBulk(ids)
  }

  @Delete(':id')
  deleteUser(@Param('id') id: number): Promise<{}> {
    return this.supplierService.delete(id);
  }
}