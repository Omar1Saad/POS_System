import { In, Repository } from "typeorm";
import { Customer } from "./entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataResponse, PaginationResponse } from "../common/types";

export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const { fullName, phone, email, } = createCustomerDto;
    const customerExists = await this.customerRepository.findOne({ where: { phone } });
    if (customerExists && phone) {
      throw new BadRequestException('Phone already exists');
    }
    const emailExists = await this.customerRepository.findOne({ where: { email } });
    if (emailExists && email) {
      throw new BadRequestException('Email already exists');
    }
    const customer = this.customerRepository.create({
        fullName,
        phone,
        email,
    });
    return this.customerRepository.save(customer);
  }

  async getCustomer(paginationResponse:PaginationResponse): Promise<DataResponse<Customer>> {
    const { page, limit } = paginationResponse;
    const skip = (page - 1) * limit;
    const take = limit;
    const [customers, total] = await this.customerRepository.findAndCount({ skip, take});
    return { 
      data:customers, 
      total ,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCustomerById(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }
  
  async updateCustomer(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const { fullName, phone, email } = updateCustomerDto;
    const customerExists = await this.customerRepository.findOne({ where: { phone } });
    if (customerExists && customerExists.id != id) {
      throw new BadRequestException('Phone already exists');
    }
    const emailExists = await this.customerRepository.findOne({ where: { email } });
    if (emailExists && emailExists.id != id) {
      throw new BadRequestException('Email already exists');
    }
    const customer = await this.getCustomerById(id);
    customer.fullName = fullName ?? customer.fullName;
    customer.phone = phone ?? customer.phone;
    customer.email = email ?? customer.email;
    return this.customerRepository.save(customer);
  }
  async delete(id:number){
    const customerExists = await this.customerRepository.findOne({where:{id}})
    if(!customerExists){
      throw new NotFoundException('Customer Not Found!')
    }
    await this.customerRepository.delete(id)
    return {"success":"Customer was Deleted Successfully!"}
  }

  async deleteBulk(ids:number[]):Promise<{}>{
    const products = await this.customerRepository.findBy({ id: In(ids) });
    if(products.length !== ids.length){
      throw new NotFoundException("One Or More Product not found!")
    }
    await this.customerRepository.delete(ids)
    return {'message':'Deleted Product was Successfully!'}
  }
}