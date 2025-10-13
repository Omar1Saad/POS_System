import { CreatePurchasesDto } from "./create-purchases.dto";
declare const UpdatePurchasesDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePurchasesDto>>;
export declare class UpdatePurchasesDto extends UpdatePurchasesDto_base {
    status?: string;
}
export {};
