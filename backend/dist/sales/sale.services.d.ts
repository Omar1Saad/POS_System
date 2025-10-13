import { Repository, DataSource } from "typeorm";
import { Sale } from "./entities/sale.entity";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { CustomerService } from "src/customers/customer.services";
import { DataResponse, PaginationResponse } from "../common/types";
export declare class SaleService {
    private readonly saleRepository;
    private readonly customerService;
    private readonly dataSource;
    constructor(saleRepository: Repository<Sale>, customerService: CustomerService, dataSource: DataSource);
    createSale(createSaleDto: CreateSaleDto, user: any): Promise<Sale>;
    getSales(user: any, paginationResponse: PaginationResponse & {
        search?: string;
        status?: string;
    }): Promise<DataResponse<Sale>>;
    getSaleById(id: number, user?: any): Promise<Sale>;
    updateSale(id: number, updateSaleDto: UpdateSaleDto, user: any): Promise<Sale>;
    updateSaleTotal(id: number, total: number): Promise<Sale>;
    delete(id: number, user: any): Promise<{}>;
    completeSale(id: number, user: any): Promise<{
        data: Sale;
        totalProfit: number;
        message: string;
    }>;
    cancelSale(id: number, user: any): Promise<Sale>;
    deleteBulk(ids: number[]): Promise<{}>;
    getSummary(period?: string, user?: any): Promise<{
        totalSales: number;
        totalAmount: number;
        averageAmount: number;
        topProducts: Array<{
            product: string;
            quantity: number;
            revenue: number;
        }>;
    }>;
}
