import { Injectable, NotFoundException } from "@nestjs/common";
import { In, Repository } from "typeorm";
import { PurchaseItems } from "./entities/purchaseItems.entity";
import { CreatePurchaseItemsDto } from "./dto/create-purchaseItems.dto";
import { UpdatePurchaseItemsDto } from "./dto/update-purchaseItems.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataResponse, PaginationResponse } from "../common/types";
import { ProductService } from "src/product/product.services";
import { PurchaseService } from "src/purchases/purchas.services";




@Injectable()
export class PurchaseItemsService {
    constructor(
        @InjectRepository(PurchaseItems)
        private readonly pItemsRepository: Repository<PurchaseItems>,
        private readonly productService: ProductService,
        private readonly purchaseService: PurchaseService
    ){}

    async createPurchaseItems(createPurchaseItemsDto:CreatePurchaseItemsDto): Promise<PurchaseItems> {
        const { productId, quantity, purchaseId, unitCost} = createPurchaseItemsDto;
        const purchaseItemsExists = await this.pItemsRepository.findOne({ where: { purchaseId, productId } });
        if(purchaseItemsExists){
            throw new NotFoundException("This product is already added to the purchase!")
        }
            const purchase = await this.purchaseService.getPurchaseById(purchaseId, null);
            if(!purchase){
                throw new NotFoundException("Purchase not found!")
            }
            if(purchase.data.status === 'completed'){
                throw new NotFoundException("Cannot add items to a completed purchase!")
            }

        const product = await this.productService.getById(productId);
        if(!product){
            throw new NotFoundException("Product not found!")
        }

        if(quantity <= 0){
            throw new NotFoundException("Quantity must be greater than zero!")
        }

        if(unitCost <= 0){
            throw new NotFoundException("Unit cost must be greater than zero!")
        }
        
        let total = unitCost * quantity;
        await this.purchaseService.updatePurchaseTotal(purchaseId,  +total );
        const purchaseItems = this.pItemsRepository.create({
            total,
            productId,
            quantity,
            purchaseId,
            unitCost
        });
        return this.pItemsRepository.save(purchaseItems);
    }

    async getPurchaseItems(paginationResponse:PaginationResponse): Promise<DataResponse<PurchaseItems>>  {
        const { page, limit } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        const [purchaseItems, total] = await this.pItemsRepository.findAndCount({ skip, take});
        return { 
          data:purchaseItems, 
          total ,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
    }

    async getPurchaseItemsById(id:number): Promise<PurchaseItems> {
        const purchaseItems = await this.pItemsRepository.findOne({ where: { id } });
        if(!purchaseItems){
            throw new NotFoundException("Purchase Items not found!")
        }
        return purchaseItems;
    }

    async updatePurchaseItems(id:number, updatePurchaseItemsDto:UpdatePurchaseItemsDto): Promise<PurchaseItems> {
        const purchaseItems = await this.pItemsRepository.findOne({ where: { id }, relations: ['purchase']});
        if(!purchaseItems){
            throw new NotFoundException("Purchase Items not found!")
        }
        if(purchaseItems.purchase.status === 'completed'){
            throw new NotFoundException("Cannot update items from a completed purchase!")
        }

        const { quantity, unitCost} = updatePurchaseItemsDto;

        let newQuantity = quantity ?? purchaseItems.quantity;
        let newUnitCost = unitCost ?? purchaseItems.unitCost;
        let newTotal = newQuantity * newUnitCost;
        await this.purchaseService.updatePurchaseTotal(purchaseItems.purchaseId,  (+purchaseItems.purchase.total - purchaseItems.total) + newTotal );

        purchaseItems.total = newTotal;
        purchaseItems.quantity = newQuantity;
        purchaseItems.unitCost = newUnitCost;

        return this.pItemsRepository.save(purchaseItems);
    }

    async delete(id:number): Promise<{}> {
        const purchaseItems = await this.pItemsRepository.findOne({ where: { id }, relations: ['purchase']});
        if(!purchaseItems){
            throw new NotFoundException("Purchase Items not found!")
        }
        if(purchaseItems.purchase.status === 'completed'){
            throw new NotFoundException("Cannot delete items from a completed purchase!")
        }
        await this.purchaseService.updatePurchaseTotal(purchaseItems.purchaseId,  +purchaseItems.purchase.total - purchaseItems.total );
        await this.pItemsRepository.delete(id);
        return {"success": "Purchase Items deleted successfully!"};
    }

    async createBulkPurchaseItems(createPurchaseItemsDto: CreatePurchaseItemsDto[]): Promise<{data: PurchaseItems[], message: string}> {
        const purchaseItems: PurchaseItems[] = [];
        let totalAmount = 0;

        for (const itemDto of createPurchaseItemsDto) {
            const { productId, quantity, purchaseId, unitCost } = itemDto;
            
            // Check if item already exists
            const existingItem = await this.pItemsRepository.findOne({ 
                where: { purchaseId, productId } 
            });
            if (existingItem) {
                throw new NotFoundException(`Product ${productId} is already added to purchase ${purchaseId}!`);
            }

            const purchase = await this.purchaseService.getPurchaseById(purchaseId, null);
            if (!purchase) {
                throw new NotFoundException("Purchase not found!");
            }

            if (purchase.data.status === 'completed') {
                throw new NotFoundException("Cannot add items to a completed purchase!");
            }

            const product = await this.productService.getById(productId);
            if (!product) {
                throw new NotFoundException("Product not found!");
            }

            if (quantity <= 0) {
                throw new NotFoundException("Quantity must be greater than zero!");
            }

            if (unitCost <= 0) {
                throw new NotFoundException("Unit cost must be greater than zero!");
            }

            const total = unitCost * quantity;
            totalAmount += total;

            const purchaseItem = this.pItemsRepository.create({
                total,
                productId,
                quantity,
                purchaseId,
                unitCost
            });

            purchaseItems.push(purchaseItem);
        }

        const savedItems = await this.pItemsRepository.save(purchaseItems);
        
        // Update purchase total
        if (savedItems.length > 0) {
            const purchase = await this.purchaseService.getPurchaseById(savedItems[0].purchaseId, null);
            if (purchase) {
                await this.purchaseService.updatePurchaseTotal(savedItems[0].purchaseId, purchase.data.total + totalAmount);
            }
        }

        return { data: savedItems, message: 'Purchase items created successfully' };
    }
}
