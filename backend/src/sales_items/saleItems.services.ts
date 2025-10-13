import { Injectable, NotFoundException } from "@nestjs/common";
import { FindManyOptions, In, Repository, DataSource } from "typeorm";
import { SalesItems } from "./entities/salesItems.entity";
import { CreateSalesItemsDto } from "./dto/create-salesItems.dto";
import { UpdateSalesItemsDto } from "./dto/update-salesItems.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataResponse, PaginationResponse } from "../common/types";
import { ProductService } from "src/product/product.services";
import { SaleService } from "src/sales/sale.services";
import { UserRole } from "src/users/entities/user.entity";




@Injectable()
export class SaleItemsService {
    constructor(
        @InjectRepository(SalesItems)
        private readonly sItemsRepository: Repository<SalesItems>,
        private readonly saleService: SaleService,
        private readonly productService: ProductService,
        private readonly dataSource: DataSource
    ){}

    async createSaleItems(createSalesItemsDto:CreateSalesItemsDto): Promise<SalesItems> {
        const { productId, quantity, saleId } = createSalesItemsDto;
        const sale = await this.saleService.getSaleById(saleId);
        const saleItemsExists = await this.sItemsRepository.findOne({ where: { saleId, productId } });
        if(saleItemsExists){
            throw new NotFoundException("This product is already added to the sale!")
        }

        if(!sale){
            throw new NotFoundException("Sale not found!")
        }

        if(sale.status === 'completed'){
            throw new NotFoundException("Cannot add items to a completed sale!")
        }

        const product = await this.productService.getById(productId);
        if(!product){
            throw new NotFoundException("Product not found!")
        }

        if(quantity <= 0){
            throw new NotFoundException(`Invalid quantity for product "${product.name}". Quantity must be greater than zero, but you entered: ${quantity}.`)
        }

        if(quantity > product.stock){
            throw new NotFoundException(`Insufficient stock for product "${product.name}". Available stock: ${product.stock}, but you requested: ${quantity}. Please reduce the quantity or choose a different product.`)
        }
        
        const unitPrice = +product.price;
        const costAtTimeOfSale = +product.averageCost; // Capture the cost at time of sale
        let total = unitPrice * quantity;
        await this.saleService.updateSaleTotal(saleId,  +sale.total + total );
        const saleItems = this.sItemsRepository.create({
            total,
            productId,
            quantity,
            saleId,
            unitPrice,
            costAtTimeOfSale,
        });
        return this.sItemsRepository.save(saleItems);
    }

    async BulkCreateSaleItems(createSalesItemsDto:CreateSalesItemsDto[]): Promise<SalesItems[]> {
        if (!createSalesItemsDto || !Array.isArray(createSalesItemsDto)) {
            throw new NotFoundException("Invalid sale items data provided");
        }

        if (createSalesItemsDto.length === 0) {
            return [];
        }

        const saleId = createSalesItemsDto[0].saleId;
        
        // Clear existing sale items and reset sale total
        await this.deleteBySaleId(saleId);
        await this.saleService.updateSaleTotal(saleId, 0);

        const salesItems:SalesItems[] = [];
        let newSaleTotal = 0;

        for(const item of createSalesItemsDto){
            const { productId, quantity } = item;
            const product = await this.productService.getById(productId);
            if(!product){
                throw new NotFoundException("One of the products not found!")
            }

            if(quantity <= 0){
                throw new NotFoundException(`Invalid quantity for product "${product.name}". Quantity must be greater than zero, but you entered: ${quantity}.`)
            }

            if(quantity > product.stock){
                throw new NotFoundException(`Insufficient stock for product "${product.name}". Available stock: ${product.stock}, but you requested: ${quantity}. Please reduce the quantity or choose a different product.`)
            }

            const unitPrice = +product.price;
            const costAtTimeOfSale = +product.averageCost; // Capture the cost at time of sale
            let total = unitPrice * quantity;
            newSaleTotal += total;
            
            const saleItems = this.sItemsRepository.create({
                total,
                productId,
                quantity,
                saleId,
                unitPrice,
                costAtTimeOfSale,
            });
            salesItems.push(saleItems);
        }

        // Update sale total with the sum of all new items
        await this.saleService.updateSaleTotal(saleId, newSaleTotal);
        
        return this.sItemsRepository.save(salesItems);
    }

    async getSaleItems(user:any,paginationResponse:PaginationResponse): Promise<DataResponse<SalesItems>> {
        const where : FindManyOptions<SalesItems>['where'] = {}
        if(user.role === UserRole.CASHIER){
            where.sale = { userId: user.id }
        }
        const { page, limit } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        const [saleItems, total] = await this.sItemsRepository.findAndCount({ where, skip, take});
        return { 
            data:saleItems, 
            total ,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getSaleItemsById(id:number, user:any): Promise<SalesItems> {
        const findSaleItems = async () => {
            if(user.role === UserRole.CASHIER){
                return await this.sItemsRepository.findOne({ where: { id, sale: { userId: user.id } } });
            }
            else{
                return await this.sItemsRepository.findOne({ where: { id } });
            }
        }
        const saleItems = await findSaleItems();
        if(!saleItems){
            throw new NotFoundException("Sale Items not found!")
        }
        return saleItems;
    }

    async updateSaleItems(id:number, updateSaleItemsDto:UpdateSalesItemsDto, user:any): Promise<SalesItems> {
        const findSaleItems = async () => {
            if(user.role === UserRole.CASHIER){
                return await this.sItemsRepository.findOne({ where: { id, sale: { userId: user.id } }, relations:['sale'] });
            }
            else{
                return await this.sItemsRepository.findOne({ where: { id }, relations:['sale'] });
            }
        }
        const saleItems = await findSaleItems();
        if(!saleItems){
            throw new NotFoundException("Sale Items not found!")
        }
        if(saleItems.sale.status === 'completed'){
            throw new NotFoundException("Cannot update items from a completed sale!")
        }
        const { quantity } = updateSaleItemsDto;
        if(!quantity){
            return saleItems;
        }
        const product = await this.productService.getById(saleItems.productId);
        if(quantity <= 0){
        throw new NotFoundException("Quantity must be greater than zero!")
        }
        if(quantity > product.stock + saleItems.quantity){
            throw new NotFoundException("Insufficient stock!")
        }

        const newTotal = quantity * saleItems.unitPrice;
        const sale = await this.saleService.getSaleById(saleItems.saleId);
        const total = +sale.total - +saleItems.total + newTotal;
        await this.saleService.updateSaleTotal(saleItems.saleId, total);

        saleItems.total = newTotal;
        saleItems.quantity = quantity;

        return this.sItemsRepository.save(saleItems);
    }

    async delete(id:number, user:any): Promise<{}> {
        const findSaleItems = async () => {
            if(user.role === UserRole.CASHIER){
                return await this.sItemsRepository.findOne({ where: { id, sale: { userId: user.id } }, relations:['sale'] });
            }
            else{
                return await this.sItemsRepository.findOne({ where: { id }, relations:['sale'] });
            }
        }
        const saleItems = await findSaleItems();
        if(!saleItems){
            throw new NotFoundException("Sale Items not found!")
        }

        if(saleItems.sale.status === 'completed'){
            throw new NotFoundException("Cannot delete items from a completed sale!")
        }

        const oldTotal = saleItems.unitPrice * saleItems.quantity;
        const sale = await this.saleService.getSaleById(saleItems.saleId);
        await this.saleService.updateSaleTotal(saleItems.saleId, +sale.total - oldTotal);

        await this.sItemsRepository.delete(id);
        return {"success": "Sale Items deleted successfully!"};
    }

    async deleteBySaleId(saleId: number): Promise<void> {
        await this.sItemsRepository.delete({ saleId });
    }
}
