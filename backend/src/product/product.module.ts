import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.services';
import { ProductController } from './product.controller';
import { Products } from './entities/product.entity';
import { CategoryModule } from 'src/categories/category.module';

@Module({
    imports:[TypeOrmModule.forFeature([Products]), CategoryModule],
    controllers:[ProductController],
    providers:[ProductService],
    exports:[ProductService]
})
export class ProductsModule {}