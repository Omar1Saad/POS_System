import { Purchase } from "src/purchases/entities/purchase.entity";
export declare class Supplier {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
    purchases: Purchase[];
}
