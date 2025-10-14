import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { ProductsModule } from './product/product.module';
import { CategoryModule } from './categories/category.module';
import { PurchasModule } from './purchases/purchas.module';
import { SaleItemsModule } from './sales_items/saleItems.module';
import { SaleModule } from './sales/sale.module';
import { CustomerModule } from './customers/customer.module';
import { SupplierModule } from './suppliers/supplier.module';
import { PurchaseItemsModule } from './purchase_items/purchaseItems.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type:'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ssl:{
          rejectUnauthorized: false,
        }
      }),
    }),
    UserModule,
    CategoryModule,
    CustomerModule,
    ProductsModule,
    SupplierModule,
    SaleModule,
    SaleItemsModule,
    PurchasModule,
    PurchaseItemsModule,
    AuthModule,
    AnalyticsModule
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
