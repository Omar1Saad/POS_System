import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { DataResponse, PaginationResponse } from "../common/types";
export declare class CategoryService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    createCategory(createCategoryDto: CreateCategoryDto): Promise<Category>;
    getCategories(paginationResponse: PaginationResponse): Promise<DataResponse<Category>>;
    getCategoryById(id: number): Promise<Category>;
    updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    delete(id: number): Promise<{
        success: string;
    }>;
    deleteBulk(ids: number[]): Promise<{}>;
}
