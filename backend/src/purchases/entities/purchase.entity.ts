import { PurchaseItems } from "src/purchase_items/entities/purchaseItems.entity";
import { Supplier } from "src/suppliers/entities/supplier.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { statusState } from "src/sales/entities/sale.entity";

@Entity('purchases')
export class Purchase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:"numeric", precision:10, scale:2, default:0})
    total: number;

    @Column({nullable: true})
    supplierId: number;

    @Column({ nullable: true })
    userId: number;

    @Column({ type: 'enum', enum: statusState , default: statusState.PENDING})
    status: string;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Supplier, supplier => supplier.purchases, {onDelete:'SET NULL', nullable: true })
    @JoinColumn({ name: 'supplierId' })
    supplier: Supplier;

    @ManyToOne(() => User, user => user.purchases, {onDelete:'SET NULL', nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(()=> PurchaseItems, purchaseItems => purchaseItems.purchase)
    purchaseItems: PurchaseItems[];
}