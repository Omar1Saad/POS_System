import { Repository } from "typeorm";
import { PurchaseItems } from "./entities/purchaseItems.entity";
import { CreatePurchaseItemsDto } from "./dto/create-purchaseItems.dto";
import { UpdatePurchaseItemsDto } from "./dto/update-purchaseItems.dto";
import { DataResponse, PaginationResponse } from "../common/types";
import { ProductService } from "src/product/product.services";
import { PurchaseService } from "src/purchases/purchas.services";
export declare class PurchaseItemsService {
    private readonly pItemsRepository;
    private readonly productService;
    private readonly purchaseService;
    constructor(pItemsRepository: Repository<PurchaseItems>, productService: ProductService, purchaseService: PurchaseService);
    createPurchaseItems(createPurchaseItemsDto: CreatePurchaseItemsDto): Promise<PurchaseItems>;
    getPurchaseItems(paginationResponse: PaginationResponse): Promise<DataResponse<PurchaseItems>>;
    getPurchaseItemsById(id: number): Promise<PurchaseItems>;
    updatePurchaseItems(id: number, updatePurchaseItemsDto: UpdatePurchaseItemsDto): Promise<PurchaseItems>;
    delete(id: number): Promise<{}>;
    createBulkPurchaseItems(createPurchaseItemsDto: CreatePurchaseItemsDto[]): Promise<{
        data: PurchaseItems[];
        message: string;
    }>;
}
