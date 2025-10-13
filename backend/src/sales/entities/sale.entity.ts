import { Customer } from "src/customers/entities/customer.entity";
import { SalesItems } from "src/sales_items/entities/salesItems.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
    MIXED = 'mixed',
}

export enum statusState{
    PENDING = 'pending',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:"numeric", precision:10, scale:2, default:0})
    total: number;

    @Column({type:"numeric", precision:10, scale:2, default:0})
    profit: number;

    @Column({nullable: true})
    userId: number;

    @Column({ nullable: true })
    customerId: number;

    @Column({ type: 'enum', enum: PaymentMethod , default: PaymentMethod.CASH})
    paymentMethod: string;

    @Column({ type: 'enum', enum: statusState , default: statusState.PENDING})
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Customer, customer => customer.sales, {onDelete: 'SET NULL', nullable: true})
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @ManyToOne(() => User, user => user.sales, {onDelete: 'SET NULL', nullable: true})
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => SalesItems, salesItems => salesItems.sale)
    salesItems: SalesItems[];
}