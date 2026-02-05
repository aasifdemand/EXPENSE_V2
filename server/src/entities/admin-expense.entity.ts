// admin-expense.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
} from 'typeorm';
import { Department } from './department.entity';
import { SubDepartment } from './sub-department.entity';

@Entity('admin_expenses')
export class AdminExpense extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'date' })
    date: Date;


    @ManyToOne(() => Department, { nullable: false })
    department: Department;

    @ManyToOne(() => SubDepartment, { nullable: true })
    subDepartment?: SubDepartment;

    @Column({ nullable: true })
    paymentMode?: string;

    @Column({ nullable: true })
    vendor?: string;

    @Column({ nullable: true })
    proof?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
