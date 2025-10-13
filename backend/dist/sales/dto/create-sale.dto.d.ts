import { PaymentMethod } from "../entities/sale.entity";
export declare class CreateSaleDto {
    customerId: number;
    paymentMethod?: PaymentMethod;
    status?: string;
}
