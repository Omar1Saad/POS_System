import { IsNumber, IsOptional } from "class-validator";


export class CreatePurchaseItemsDto {

    @IsNumber()
    purchaseId: number;
    
    @IsNumber()
    productId: number;

    @IsNumber()
    quantity:number

    @IsNumber()
    unitCost: number;
}