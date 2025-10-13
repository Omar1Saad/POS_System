import { Repository, DataSource } from "typeorm";
import { CreatePurchasesDto } from "./dto/create-purchases.dto";
import { Purchase } from "./entities/purchase.entity";
import { UpdatePurchasesDto } from "./dto/update-purchases.dto";
import { SupplierService } from "src/suppliers/supplier.services";
import { DataResponse, PaginationResponse } from "../common/types";
export declare class PurchaseService {
    private readonly purchasesRepository;
    private readonly supplierService;
    private readonly dataSource;
    constructor(purchasesRepository: Repository<Purchase>, supplierService: SupplierService, dataSource: DataSource);
    createPurchase(createPurchasesDto: CreatePurchasesDto, user: any): Promise<{
        data: Purchase;
        message: string;
    }>;
    getPurchases(user: any, paginationResponse: PaginationResponse & {
        search?: string;
        status?: string;
    }): Promise<DataResponse<Purchase>>;
    getPurchaseById(id: number, user: any): Promise<{
        data: Purchase;
        message: string;
    }>;
    updatePurchase(id: number, updatePurchasesDto: UpdatePurchasesDto, user: any): Promise<{
        data: Purchase;
        message: string;
    }>;
    updatePurchaseTotal(id: number, total: number): Promise<Purchase>;
    completePurchase(id: number, user: any): Promise<{
        data: Purchase;
        message: string;
    }>;
    cancelPurchase(id: number, user: any): Promise<{
        data: Purchase;
        message: string;
    }>;
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
    deleteBulk(ids: number[]): Promise<{
        message: string;
    }>;
    delete(id: number, user: any): Promise<{
        message: string;
    }>;
}
