import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "./entities/category.entity";
import { CategoryService } from "./category.services";
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    createUser(createCategoryDto: CreateCategoryDto): Promise<Category>;
    getUsers(page: number, limit: number): Promise<import("../common/types").DataResponse<Category>>;
    getUserById(id: number): Promise<Category>;
    updateUser(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    deleteBulk(ids: number[]): Promise<{}>;
    deleteUser(id: number): Promise<{}>;
}
