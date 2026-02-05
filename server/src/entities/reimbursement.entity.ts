import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
} from 'typeorm';
import { Expense } from './expense.entity';
import { User } from './user.entity';

@Entity('reimbursements')
export class Reimbursement extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* =====================
       EXPENSE (OWNING SIDE)
       ===================== */
    @OneToOne(() => Expense, (expense) => expense.reimbursement, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'expenseId' })
    expense?: Expense;


    /* =====================
       REQUESTED BY (OWNING SIDE)
       ===================== */
    @ManyToOne(() => User, (user) => user.reimbursements, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'requestedById' }) // 🔥 REQUIRED
    requestedBy: User;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ default: false })
    isReimbursed: boolean;

    @Column({ type: 'timestamp', nullable: true })
    reimbursedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
