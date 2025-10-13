import {
    IsInt,
    IsOptional,
    IsString,
    IsNumber,
} from 'class-validator'

export class CreateProductDto{
    @IsString()
    name:string;
    
    @IsString()
    @IsOptional()
    barcode:string

    @IsNumber()
    @IsOptional()
    categoryId:number

    @IsNumber()
    @IsOptional()
    price:number
    
    @IsNumber()
    @IsOptional()
    stock:number

    @IsNumber()
    @IsOptional()
    averageCost:number

    @IsNumber()
    @IsOptional()
    profitPercentage:number
    
};