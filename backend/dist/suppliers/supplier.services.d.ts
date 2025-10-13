import { Repository } from "typeorm";
import { Supplier } from "./entities/supplier.entity";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { DataResponse, PaginationResponse } from "../common/types";
export declare class SupplierService {
    private readonly supplierRepository;
    constructor(supplierRepository: Repository<Supplier>);
    createSupplier(createSupplierDto: CreateSupplierDto): Promise<Supplier>;
    getSuppliers(paginationResponse: PaginationResponse): Promise<DataResponse<Supplier>>;
    getSupplierById(id: number): Promise<Supplier>;
    updateSupplier(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier>;
    deleteBulk(ids: number[]): Promise<{}>;
    delete(id: number): Promise<{
        success: string;
    }>;
}
