import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    BaseEntity,
} from 'typeorm';

import { UserRole, UserDepartment, UserLocation } from 'src/enums/user.enum';
import { Expense } from './expense.entity';
import { Budget } from './budget.entity';
import { Reimbursement } from './reimbursement.entity';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    // ✅ Shared 2FA secret (across devices)
    @Column({ nullable: true })
    twoFactorSecret?: string;

    @Column({
        type: 'enum',
        enum: UserDepartment,
        default: UserDepartment.GENERAL,
    })
    department: UserDepartment;

    @Column({
        type: 'enum',
        enum: UserLocation,
        default: UserLocation.OVERALL,
    })
    userLoc: UserLocation;

    /* ===========================
       Relations
       =========================== */

    @OneToMany(() => Expense, (expense) => expense.user)
    expenses: Expense[];

    @ManyToMany(() => Budget)
    @JoinTable({
        name: 'user_allocated_budgets',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'budget_id', referencedColumnName: 'id' },
    })
    allocatedBudgets: Budget[];

    @OneToMany(() => Reimbursement, (reimbursement) => reimbursement.requestedBy)
    reimbursements: Reimbursement[];


    /* ===========================
       Financial Fields
       =========================== */

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    spentAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    reimbursedAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    allocatedAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    budgetLeft: number;

    /* ===========================
       Timestamps
       =========================== */

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
