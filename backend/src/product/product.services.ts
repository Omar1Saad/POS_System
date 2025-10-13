import { Injectable, ConflictException, NotFoundException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { Products } from "./entities/product.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CategoryService } from "src/categories/category.services";
import { DataResponse, PaginationResponse, DeleteResponse } from "../common/types";
@Injectable()
export class ProductService{
    constructor(
        @InjectRepository(Products)
        private readonly productRepository: Repository<Products>,
        private readonly categoryService: CategoryService
    ){}

    private calculatePrice(averageCost: number, profitPercentage: number = 25): number {
        if (!averageCost || averageCost <= 0) {
            return 0;
        }
        
        // Ensure numbers are properly converted
        const cost = Number(averageCost);
        const percentage = Number(profitPercentage);
        
        const profitAmount = cost * percentage / 100;
        const calculatedPrice = Math.round((cost + profitAmount) * 100) / 100; // Round to 2 decimal places
        
        return calculatedPrice;
    }
    async create(createProductDto: CreateProductDto): Promise<Products> {
      const { name, categoryId } = createProductDto;
      
      await this.validateCategoryExists(categoryId);
      await this.validateProductNameUnique(name);
      
      const productData = this.buildProductData(createProductDto);
      const product = this.productRepository.create(productData);
      
      return this.productRepository.save(product);
    }

    private async validateCategoryExists(categoryId: number): Promise<void> {
      const category = await this.categoryService.getCategoryById(categoryId);
      if(!category){
        throw new NotFoundException("Category not found!")
      }
    }

    private async validateProductNameUnique(name: string): Promise<void> {
      const existingProduct = await this.productRepository.findOne({ where: { name }});
      if (existingProduct) {
        throw new ConflictException('Product with this name already exists');
      }
    }

    private buildProductData(createProductDto: CreateProductDto): Partial<Products> {
      const { name, price, categoryId, barcode, stock, profitPercentage, averageCost } = createProductDto;
      
      // Calculate price based on average cost and profit percentage
      const calculatedPrice = averageCost > 0 ? this.calculatePrice(averageCost, profitPercentage) : price;
      
      return {
        name,
        price: calculatedPrice,
        categoryId,
        barcode,
        stock,
        averageCost: averageCost || 0,
        profitPercentage: profitPercentage || 25.00,
      };
    }
    async getAll(paginationResponse:PaginationResponse):Promise<DataResponse<Products>>{
      const { page, limit } = paginationResponse;
      const skip = (page - 1) * limit;
      const take = limit;
      const [products, total] = await this.productRepository.findAndCount({ skip, take, relations:['category'] });
      return { 
        data:products, 
        total ,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    async getById(id:number):Promise<Products>{
      const product = await this.productRepository.findOne({ where: { id }, relations:['category'] });
      if(!product){
        throw new NotFoundException("Product not found!")
      }      
      return product
    }

    async update(id:number, updateProductDto: UpdateProductDto): Promise<Products> {
      const product = await this.findProductById(id);
      await this.validateUpdateData(id, updateProductDto);
      this.updateProductFields(product, updateProductDto);
      this.updateProductPricing(product, updateProductDto);
      
      return this.productRepository.save(product);
    }

    private async findProductById(id: number): Promise<Products> {
      const product = await this.productRepository.findOne({ where: { id } });
      if(!product){
        throw new NotFoundException("Product not found!")
      }
      return product;
    }

    private async validateUpdateData(id: number, updateProductDto: UpdateProductDto): Promise<void> {
      const { name, barcode, categoryId } = updateProductDto;
      
      if(categoryId){
        const category = await this.categoryService.getCategoryById(categoryId);
        if(!category){
          throw new NotFoundException("Category not found!")
        }
      }
      
      if(name){
        const existingProduct = await this.productRepository.findOne({ where: { name } });
        if (existingProduct && existingProduct.id !== +id) {
          throw new ConflictException('Product with this name already exists');
        }
      }
      
      if(barcode){
        const existingProduct = await this.productRepository.findOne({ where: { barcode } });
        if (existingProduct && existingProduct.id !== +id) {
          throw new ConflictException('Product with this barcode already exists');
        }
      }
    }

    private updateProductFields(product: Products, updateProductDto: UpdateProductDto): void {
      const { name, barcode, stock, categoryId } = updateProductDto;
      
      if (name) product.name = name;
      if (barcode) product.barcode = barcode;
      if (categoryId) product.categoryId = categoryId;
      
      // Handle stock update - if stock is explicitly set to 0, update it
      if (stock === 0) {
        product.stock = 0;
      } else if (stock !== undefined) {
        product.stock = stock;
      }
    }

    private updateProductPricing(product: Products, updateProductDto: UpdateProductDto): void {
      const { price, averageCost, profitPercentage } = updateProductDto;
      
      // Update average cost if provided
      if (averageCost !== undefined) {
        product.averageCost = averageCost;
      }
      
      // Update profit percentage if provided
      if (profitPercentage !== undefined) {
        product.profitPercentage = profitPercentage;
      }
      
      // Recalculate price based on average cost and profit percentage
      const currentAverageCost = averageCost !== undefined ? averageCost : product.averageCost;
      const currentProfitPercentage = profitPercentage !== undefined ? profitPercentage : product.profitPercentage;
      
      if (currentAverageCost > 0) {
        product.price = this.calculatePrice(currentAverageCost, currentProfitPercentage);
      } else if (price !== undefined) {
        // Fallback to manual price if no average cost
        product.price = price;
      }
    }

    async delete(id:number):Promise<DeleteResponse>{
      const product = await this.productRepository.findOne({ where: { id } });
      if(!product){
        throw new NotFoundException("Product not found!")
      }
      await this.productRepository.delete(id)
      return {'message':'Product deleted successfully!'}
    }

    async deleteBulk(ids:number[]):Promise<DeleteResponse>{
      const products = await this.productRepository.findBy({ id: In(ids) });
      if(products.length !== ids.length){
        throw new NotFoundException("One or more products not found!")
      }
      await this.productRepository.delete(ids)
      return {'message':'Products deleted successfully!'}
    }
}


