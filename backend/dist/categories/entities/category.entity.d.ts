import { Products } from "src/product/entities/product.entity";
export declare class Category {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    products: Products[];
}
