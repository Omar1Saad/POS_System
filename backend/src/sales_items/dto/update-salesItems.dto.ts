import { IsOptional } from "class-validator";


export class UpdateSalesItemsDto  {
    @IsOptional()
    quantity?: number;
}