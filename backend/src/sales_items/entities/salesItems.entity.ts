import { Products } from "src/product/entities/product.entity";
import { Sale } from "src/sales/entities/sale.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";


@Unique(['saleId', 'productId'])
@Entity('sales_items')
export class SalesItems {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    saleId: number;
    
    @Column()
    productId: number;
    
    @Column()
    quantity:number
    
    @Column({type:"numeric", precision:10, scale:2})
    total: number;

    @Column({type:"numeric", precision:10, scale:2})
    unitPrice: number;

    @Column({type:"numeric", precision:10, scale:2, default:0})
    costAtTimeOfSale: number;

    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Sale, sale => sale.salesItems, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'saleId' })
    sale: Sale;

    @ManyToOne(()=> Products, product => product.salesItems, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'productId' })
    product: Products;
}