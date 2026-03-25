// expense.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToOne,
    Index,
} from 'typeorm';
import { Department } from './department.entity';
import { SubDepartment } from './sub-department.entity';
import { User } from './user.entity';
import { Budget } from './budget.entity';
import { Reimbursement } from './reimbursement.entity';

@Entity('expenses')
export class Expense extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    fromAllocation: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    fromReimbursement: number;

    @Column({ type: 'date' })
    @Index()
    date: Date;

    @ManyToOne(() => Department, { nullable: false })
    @Index()
    department: Department;

    @ManyToOne(() => SubDepartment, { nullable: true })
    subDepartment?: SubDepartment;

    @Column({ nullable: true })
    paymentMode?: string;

    @Column({ nullable: true })
    vendor?: string;

    @Column({ nullable: true })
    proof?: string;

    @ManyToOne(() => User, (user) => user.expenses, { nullable: false })
    @Index()
    user: User;

    @ManyToOne(() => Budget, (budget) => budget.expense, { nullable: true })
    budget?: Budget;

    @OneToOne(() => Reimbursement, (r) => r.expense)
    reimbursement?: Reimbursement;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
