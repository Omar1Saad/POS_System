import { Products } from "src/product/entities/product.entity";
import { Purchase } from "src/purchases/entities/purchase.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Unique(['purchaseId', 'productId']) 
@Entity('purchase_items')
export class PurchaseItems {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    purchaseId: number;
    
    @Column()
    productId: number;
    
    @Column()
    quantity:number
    
    @Column({type:"numeric", precision:10, scale:2})
    total: number;

    @Column({type:"numeric", precision:10, scale:2})
    unitCost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

    @ManyToOne(()=> Purchase, purchase => purchase.purchaseItems, {onDelete:'CASCADE'})
    @JoinColumn({ name: 'purchaseId' })
    purchase: Purchase;

    @ManyToOne(()=> Products, product => product.purchaseItems, {onDelete:'CASCADE'})
    @JoinColumn({ name: 'productId' })
    product: Products;
}