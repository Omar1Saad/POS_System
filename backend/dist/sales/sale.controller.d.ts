import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { SaleService } from "./sale.services";
export declare class SaleController {
    private readonly saleService;
    constructor(saleService: SaleService);
    create(createSaleDto: CreateSaleDto, req: any): Promise<import("./entities/sale.entity").Sale>;
    findAll(req: any, page: number, limit: number, search?: string, status?: string): Promise<import("../common/types").DataResponse<import("./entities/sale.entity").Sale>>;
    getSummary(period: string | undefined, req: any): Promise<{
        totalSales: number;
        totalAmount: number;
        averageAmount: number;
        topProducts: Array<{
            product: string;
            quantity: number;
            revenue: number;
        }>;
    }>;
    findOne(id: number, req: any): Promise<import("./entities/sale.entity").Sale>;
    update(id: number, updateSaleDto: UpdateSaleDto, req: any): Promise<import("./entities/sale.entity").Sale>;
    removeBulk(ids: number[]): Promise<{}>;
    remove(id: number, req: any): Promise<{}>;
    complete(id: number, req: any): Promise<{
        data: import("./entities/sale.entity").Sale;
        totalProfit: number;
        message: string;
    }>;
    cancel(id: number, req: any): Promise<import("./entities/sale.entity").Sale>;
}
