import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    UseGuards,
    Query,
    ParseIntPipe,
    DefaultValuePipe
} from '@nestjs/common';
import { ProductService } from './product.services';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRole } from "src/users/entities/user.entity";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductController{
    constructor(private readonly productService: ProductService){}
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @Post()
    async create(@Body() createProductDto:CreateProductDto){
        return this.productService.create(createProductDto)
    }
    
    @Get()
    async getAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page:number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit:number,
        @Query('categoryId') categoryId?:number,
    ){
        return this.productService.getAll({ page, limit })
    }

    @Get(':id')
    async getById(@Param('id') id:number){
        return this.productService.getById(id)
    }

    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @Patch(':id')
    async update(@Param('id') id:number, @Body() updateProductDto:UpdateProductDto){
        return this.productService.update(id, updateProductDto)
    }
    
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @Delete('/bulk')
    async deleteBulk(@Body('ids') ids:number[]){
        return this.productService.deleteBulk(ids)
    }
    
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @Delete(':id')
    async delete(@Param('id') id:number){
        return this.productService.delete(id)
    }

}
