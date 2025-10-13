import { Category } from 'src/categories/entities/category.entity';
import { PurchaseItems } from 'src/purchase_items/entities/purchaseItems.entity';
import { SalesItems } from 'src/sales_items/entities/salesItems.entity';
export declare class Products {
    id: number;
    name: string;
    barcode: string;
    categoryId: number;
    price: number;
    stock: number;
    averageCost: number;
    profitPercentage: number;
    createAt: Date;
    updateAt: Date;
    category: Category;
    salesItems: SalesItems[];
    purchaseItems: PurchaseItems[];
}
