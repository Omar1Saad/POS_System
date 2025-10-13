import { Customer } from "src/customers/entities/customer.entity";
import { SalesItems } from "src/sales_items/entities/salesItems.entity";
import { User } from "src/users/entities/user.entity";
export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    MIXED = "mixed"
}
export declare enum statusState {
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Sale {
    id: number;
    total: number;
    profit: number;
    userId: number;
    customerId: number;
    paymentMethod: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    customer: Customer;
    user: User;
    salesItems: SalesItems[];
}
