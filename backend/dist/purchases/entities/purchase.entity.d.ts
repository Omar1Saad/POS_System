import { PurchaseItems } from "src/purchase_items/entities/purchaseItems.entity";
import { Supplier } from "src/suppliers/entities/supplier.entity";
import { User } from "src/users/entities/user.entity";
export declare class Purchase {
    id: number;
    total: number;
    supplierId: number;
    userId: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    supplier: Supplier;
    user: User;
    purchaseItems: PurchaseItems[];
}
