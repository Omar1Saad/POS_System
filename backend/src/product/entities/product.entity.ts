import { Category } from 'src/categories/entities/category.entity';
import { PurchaseItems } from 'src/purchase_items/entities/purchaseItems.entity';
import { SalesItems } from 'src/sales_items/entities/salesItems.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'

@Entity('Products')
export class Products{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique:true, type:"varchar", length:150})
    name:string;
 
    @Column({unique:true, type:"varchar", length:50, nullable:true})
    barcode:string;

    @Column({type:"int", nullable:true})
    categoryId:number;

    @Column({type:'numeric', precision:10, scale:2})
    price:number

    @Column({type:"int", default:0})
    stock:number;

    @Column({type:'numeric', precision:10, scale:2, default:0})
    averageCost:number;

    @Column({type:'numeric', precision:5, scale:2, default:25.00})
    profitPercentage:number;
    
    @CreateDateColumn()
    createAt:Date;
    
    @UpdateDateColumn()
    updateAt:Date;

    @ManyToOne(() => Category, category => category.products, {onDelete: 'SET NULL', nullable: true})
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @OneToMany(()=> SalesItems, salesItems => salesItems.product)
    salesItems: SalesItems[];

    @OneToMany(()=> PurchaseItems, purchaseItems => purchaseItems.product)
    purchaseItems: PurchaseItems[];
}