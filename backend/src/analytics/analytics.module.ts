import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Sale } from '../sales/entities/sale.entity';
import { SalesItems } from '../sales_items/entities/salesItems.entity';
import { Products } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SalesItems, Products])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
