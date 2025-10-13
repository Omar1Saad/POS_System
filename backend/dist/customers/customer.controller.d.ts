import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { Customer } from "./entities/customer.entity";
import { CustomerService } from "./customer.services";
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    createUser(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    getUsers(page: number, limit: number): Promise<import("../common/types").DataResponse<Customer>>;
    getUserById(id: number): Promise<Customer>;
    updateUser(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    deleteBulk(ids: number[]): Promise<{}>;
    deleteUser(id: number): Promise<{}>;
}
