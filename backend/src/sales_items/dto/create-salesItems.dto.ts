import { IsNumber, IsOptional } from "class-validator";


export class CreateSalesItemsDto {

    @IsNumber()
    saleId: number;
    
    @IsNumber()
    productId: number;

    @IsNumber()
    quantity:number
}