import { PartialType } from "@nestjs/mapped-types";
import { CreatePurchaseItemsDto } from "./create-purchaseItems.dto";


export class UpdatePurchaseItemsDto extends PartialType(CreatePurchaseItemsDto) {}