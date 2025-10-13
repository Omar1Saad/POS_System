import { IsNumber, IsOptional, IsString, IsArray } from "class-validator";


export class CreatePurchasesDto {
        
    @IsNumber()
    supplierId: number;

    @IsNumber()
    @IsOptional()
    total?: number;

    @IsArray()
    @IsOptional()
    purchaseItems?: any[];
}