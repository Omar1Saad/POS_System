import { Products } from "src/product/entities/product.entity";
import { Purchase } from "src/purchases/entities/purchase.entity";
export declare class PurchaseItems {
    id: number;
    purchaseId: number;
    productId: number;
    quantity: number;
    total: number;
    unitCost: number;
    createdAt: Date;
    updatedAt: Date;
    purchase: Purchase;
    product: Products;
}
