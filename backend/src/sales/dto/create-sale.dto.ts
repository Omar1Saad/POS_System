import { IsNumber, IsOptional } from "class-validator";
import { PaymentMethod } from "../entities/sale.entity";


export class CreateSaleDto {
    
    @IsNumber()
    customerId: number;

    @IsNumber()
    @IsOptional()
    paymentMethod?: PaymentMethod;

    @IsNumber()
    @IsOptional()
    status?: string;
}