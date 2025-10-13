import { Products } from "src/product/entities/product.entity";
import { Sale } from "src/sales/entities/sale.entity";
export declare class SalesItems {
    id: number;
    saleId: number;
    productId: number;
    quantity: number;
    total: number;
    unitPrice: number;
    costAtTimeOfSale: number;
    createdAt: Date;
    updatedAt: Date;
    sale: Sale;
    product: Products;
}
