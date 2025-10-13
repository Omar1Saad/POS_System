import { Repository, DataSource } from "typeorm";
import { SalesItems } from "./entities/salesItems.entity";
import { CreateSalesItemsDto } from "./dto/create-salesItems.dto";
import { UpdateSalesItemsDto } from "./dto/update-salesItems.dto";
import { DataResponse, PaginationResponse } from "../common/types";
import { ProductService } from "src/product/product.services";
import { SaleService } from "src/sales/sale.services";
export declare class SaleItemsService {
    private readonly sItemsRepository;
    private readonly saleService;
    private readonly productService;
    private readonly dataSource;
    constructor(sItemsRepository: Repository<SalesItems>, saleService: SaleService, productService: ProductService, dataSource: DataSource);
    createSaleItems(createSalesItemsDto: CreateSalesItemsDto): Promise<SalesItems>;
    BulkCreateSaleItems(createSalesItemsDto: CreateSalesItemsDto[]): Promise<SalesItems[]>;
    getSaleItems(user: any, paginationResponse: PaginationResponse): Promise<DataResponse<SalesItems>>;
    getSaleItemsById(id: number, user: any): Promise<SalesItems>;
    updateSaleItems(id: number, updateSaleItemsDto: UpdateSalesItemsDto, user: any): Promise<SalesItems>;
    delete(id: number, user: any): Promise<{}>;
    deleteBySaleId(saleId: number): Promise<void>;
}
