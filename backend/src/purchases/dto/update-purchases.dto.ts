import { PartialType } from "@nestjs/mapped-types";
import { CreatePurchasesDto } from "./create-purchases.dto";
import { IsString, IsOptional } from "class-validator";

export class UpdatePurchasesDto extends PartialType(CreatePurchasesDto) {
    @IsString()
    @IsOptional()
    status?: string;
}