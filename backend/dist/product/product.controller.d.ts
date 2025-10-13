import { ProductService } from './product.services';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    create(createProductDto: CreateProductDto): Promise<import("./entities/product.entity").Products>;
    getAll(page: number, limit: number, categoryId?: number): Promise<import("../common/types").DataResponse<import("./entities/product.entity").Products>>;
    getById(id: number): Promise<import("./entities/product.entity").Products>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<import("./entities/product.entity").Products>;
    deleteBulk(ids: number[]): Promise<import("../common/types").DeleteResponse>;
    delete(id: number): Promise<import("../common/types").DeleteResponse>;
}
