import { Sale } from "src/sales/entities/sale.entity";
export declare class Customer {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    sales: Sale[];
}
