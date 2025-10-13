import { Repository } from "typeorm";
import { Customer } from "./entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { DataResponse, PaginationResponse } from "../common/types";
export declare class CustomerService {
    private readonly customerRepository;
    constructor(customerRepository: Repository<Customer>);
    createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    getCustomer(paginationResponse: PaginationResponse): Promise<DataResponse<Customer>>;
    getCustomerById(id: number): Promise<Customer>;
    updateCustomer(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    delete(id: number): Promise<{
        success: string;
    }>;
    deleteBulk(ids: number[]): Promise<{}>;
}
