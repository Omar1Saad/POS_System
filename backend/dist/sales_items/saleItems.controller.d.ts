import { CreateSalesItemsDto } from "./dto/create-salesItems.dto";
import { UpdateSalesItemsDto } from "./dto/update-salesItems.dto";
import { SaleItemsService } from "./saleItems.services";
export declare class SaleItemsController {
    private readonly saleService;
    constructor(saleService: SaleItemsService);
    create(createSaleDto: CreateSalesItemsDto): Promise<import("./entities/salesItems.entity").SalesItems>;
    bulkCreate(createSaleDto: CreateSalesItemsDto[]): Promise<import("./entities/salesItems.entity").SalesItems[]>;
    findAll(req: any, page: number, limit: number): Promise<import("../common/types").DataResponse<import("./entities/salesItems.entity").SalesItems>>;
    findOne(id: number, req: any): Promise<import("./entities/salesItems.entity").SalesItems>;
    update(id: number, updateSaleDto: UpdateSalesItemsDto, req: any): Promise<import("./entities/salesItems.entity").SalesItems>;
    remove(id: number, req: any): Promise<{}>;
    removeBySaleId(saleId: number, req: any): Promise<void>;
}
