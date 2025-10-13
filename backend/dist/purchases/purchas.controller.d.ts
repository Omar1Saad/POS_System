import { CreatePurchasesDto } from "./dto/create-purchases.dto";
import { UpdatePurchasesDto } from "./dto/update-purchases.dto";
import { PurchaseService } from "./purchas.services";
export declare class PurchasController {
    private readonly purchaseService;
    constructor(purchaseService: PurchaseService);
    create(createPurchasesDto: CreatePurchasesDto, req: any): Promise<{
        data: import("./entities/purchase.entity").Purchase;
        message: string;
    }>;
    findAll(req: any, page: number, limit: number, search?: string, status?: string): Promise<import("../common/types").DataResponse<import("./entities/purchase.entity").Purchase>>;
    getSummary(period?: string): Promise<{
        totalPurchases: number;
        totalAmount: number;
        averageAmount: number;
        topSuppliers: Array<{
            supplier: string;
            orders: number;
            amount: number;
        }>;
    }>;
    findOne(id: number, req: any): Promise<{
        data: import("./entities/purchase.entity").Purchase;
        message: string;
    }>;
    update(id: number, updatePurchaseesDto: UpdatePurchasesDto, req: any): Promise<{
        data: import("./entities/purchase.entity").Purchase;
        message: string;
    }>;
    deleteBulk(ids: number[]): Promise<{
        message: string;
    }>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
    complete(id: number, req: any): Promise<{
        data: import("./entities/purchase.entity").Purchase;
        message: string;
    }>;
    cancel(id: number, req: any): Promise<{
        data: import("./entities/purchase.entity").Purchase;
        message: string;
    }>;
}
