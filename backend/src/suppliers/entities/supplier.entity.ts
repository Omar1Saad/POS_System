import { Purchase } from "src/purchases/entities/purchase.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'varchar', length: 150})
  name: string;

  @Column({ unique: true, type: 'varchar', length: 20 })
  phone: string;

  @Column({ unique: true , type: 'varchar', length: 100 })
  email: string;

  @Column({type: 'text'})
  address: string;
 
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Purchase, purchase => purchase.supplier)
  purchases: Purchase[];
}