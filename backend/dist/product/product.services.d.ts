import { Repository } from "typeorm";
import { Products } from "./entities/product.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CategoryService } from "src/categories/category.services";
import { DataResponse, PaginationResponse, DeleteResponse } from "../common/types";
export declare class ProductService {
    private readonly productRepository;
    private readonly categoryService;
    constructor(productRepository: Repository<Products>, categoryService: CategoryService);
    private calculatePrice;
    create(createProductDto: CreateProductDto): Promise<Products>;
    private validateCategoryExists;
    private validateProductNameUnique;
    private buildProductData;
    getAll(paginationResponse: PaginationResponse): Promise<DataResponse<Products>>;
    getById(id: number): Promise<Products>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<Products>;
    private findProductById;
    private validateUpdateData;
    private updateProductFields;
    private updateProductPricing;
    delete(id: number): Promise<DeleteResponse>;
    deleteBulk(ids: number[]): Promise<DeleteResponse>;
}
