import { CreatePurchaseItemsDto } from "./dto/create-purchaseItems.dto";
import { UpdatePurchaseItemsDto } from "./dto/update-purchaseItems.dto";
import { PurchaseItemsService } from "./purchaseItems.services";
export declare class PurchaseItemsController {
    private readonly purchaseItemsService;
    constructor(purchaseItemsService: PurchaseItemsService);
    create(createPurchaseItemsDto: CreatePurchaseItemsDto): Promise<import("./entities/purchaseItems.entity").PurchaseItems>;
    findAll(page: number, limit: number): Promise<import("../common/types").DataResponse<import("./entities/purchaseItems.entity").PurchaseItems>>;
    findOne(id: number): Promise<import("./entities/purchaseItems.entity").PurchaseItems>;
    update(id: number, updatePurchaseItemsDto: UpdatePurchaseItemsDto): Promise<import("./entities/purchaseItems.entity").PurchaseItems>;
    remove(id: number): Promise<{}>;
    createBulk(createPurchaseItemsDto: CreatePurchaseItemsDto[]): Promise<{
        data: import("./entities/purchaseItems.entity").PurchaseItems[];
        message: string;
    }>;
}
