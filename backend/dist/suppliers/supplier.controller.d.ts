import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { Supplier } from "./entities/supplier.entity";
import { SupplierService } from "./supplier.services";
export declare class SupplierController {
    private readonly supplierService;
    constructor(supplierService: SupplierService);
    createUser(createSupplierDto: CreateSupplierDto): Promise<Supplier>;
    getUsers(page: number, limit: number): Promise<import("../common/types").DataResponse<Supplier>>;
    getUserById(id: number): Promise<Supplier>;
    updateUser(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier>;
    deleteBulk(ids: number[]): Promise<{}>;
    deleteUser(id: number): Promise<{}>;
}
