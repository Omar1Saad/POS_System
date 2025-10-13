import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { Customer } from "./entities/customer.entity";
import { CustomerService } from "./customer.services";
import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRole } from "src/users/entities/user.entity";
import { Roles } from "src/auth/decorators/roles.decorator";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  
  @Post()
  createUser(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customerService.createCustomer(createCustomerDto);
  }
  @Get()
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page:number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit:number,
  ) {
    return this.customerService.getCustomer({page, limit});
  }

  @Get(':id')
  getUserById(@Param('id') id: number): Promise<Customer> {
    return this.customerService.getCustomerById(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER)
  @Patch(':id')
  updateUser(@Param('id') id: number, @Body() updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    return this.customerService.updateCustomer(id, updateCustomerDto);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Delete('/bulk')
  async deleteBulk(@Body('ids') ids:number[]){
      return this.customerService.deleteBulk(ids)
  }
  
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Delete(':id')
  deleteUser(@Param('id') id: number): Promise<{}> {
    return this.customerService.delete(id);
  }
}