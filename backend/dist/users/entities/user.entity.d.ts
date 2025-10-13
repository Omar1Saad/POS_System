import { Purchase } from "src/purchases/entities/purchase.entity";
import { Sale } from "src/sales/entities/sale.entity";
export declare enum UserRole {
    ADMIN = "admin",
    CASHIER = "cashier",
    MANAGER = "manager"
}
export declare class User {
    id: number;
    fullName: string;
    username: string;
    email: string;
    role: UserRole;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    sales: Sale[];
    purchases: Purchase[];
}
