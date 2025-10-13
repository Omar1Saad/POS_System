import { In, Repository } from "typeorm";
import { Supplier } from "./entities/supplier.entity";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataResponse, PaginationResponse } from "../common/types";

export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async createSupplier(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const { name, phone, email, address} = createSupplierDto;
    const supplierExists = await this.supplierRepository.findOne({ where: { phone } });
    if (supplierExists) {
      throw new BadRequestException('Phone already exists');
    }
    const emailExists = await this.supplierRepository.findOne({ where: { email } });
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }
    const supplier = this.supplierRepository.create({
      name,
      phone,
      email,
      address,
    });
    return this.supplierRepository.save(supplier);
  }

  async getSuppliers(paginationResponse:PaginationResponse): Promise<DataResponse<Supplier>> {
    const { page, limit } = paginationResponse;
    const skip = (page - 1) * limit;
    const take = limit;
    const [supplieres, total] = await this.supplierRepository.findAndCount({ skip, take});
    return { 
      data:supplieres, 
      total ,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSupplierById(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }
  
  async updateSupplier(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const { name, phone, email, address} = updateSupplierDto;
    const supplierExists = await this.supplierRepository.findOne({ where: { phone } });
    if (supplierExists && supplierExists.id != id) {
      throw new BadRequestException('Phone already exists');
    }
    const emailExists = await this.supplierRepository.findOne({ where: { email } });
    if (emailExists && emailExists.id != id) {
      throw new BadRequestException('Email already exists');
    }
    const supplier = await this.getSupplierById(id);

    supplier.name = name || supplier.name;
    supplier.phone = phone || supplier.phone;
    supplier.email = email || supplier.email;
    supplier.address = address || supplier.address;

    return this.supplierRepository.save(supplier);
  }

  async deleteBulk(ids:number[]):Promise<{}>{
    const products = await this.supplierRepository.findBy({ id: In(ids) });
    if(products.length !== ids.length){
      throw new NotFoundException("One Or More Product not found!")
    }
    await this.supplierRepository.delete(ids)
    return {'message':'Deleted Product was Successfully!'}
  }

  async delete(id:number){
    const supplierExists = await this.supplierRepository.findOne({where:{id}})
    if(!supplierExists){
      throw new NotFoundException('Supplier Not Found!')
    }
    await this.supplierRepository.delete(id)
    return {"success":"Supplier was Deleted Successfully!"}
  }
}