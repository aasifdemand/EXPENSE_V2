// budget.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    BeforeInsert,
    BeforeUpdate,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Expense } from './expense.entity';

export enum BudgetType {
    NORMAL = 'Normal',
    REIMBURSED = 'Reimbursement',
}

@Entity('budgets')
export class Budget extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { nullable: false })
    user: User;

    @OneToOne(() => Expense, { nullable: true })
    @JoinColumn()
    expense?: Expense;

    @Column({ nullable: true })
    company?: string;

    @Column({
        type: 'enum',
        enum: BudgetType,
        default: BudgetType.NORMAL,
    })
    type: BudgetType;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    allocatedAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    spentAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    remainingAmount: number;

    @Column()
    month: number;

    @Column()
    year: number;


    @BeforeInsert()
    computeInitialAmounts() {
        this.allocatedAmount = Number(this.allocatedAmount || 0);
        this.spentAmount = Number(this.spentAmount || 0);
        this.remainingAmount = this.allocatedAmount;
    }


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
