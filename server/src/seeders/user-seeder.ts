import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as argon2 from 'argon2';

import { User } from '../entities/user.entity';
import { UserDepartment, UserLocation, UserRole } from '../enums/user.enum';
import { Expense } from '../entities/expense.entity';
import { Budget } from '../entities/budget.entity';
import { Department } from '../entities/department.entity';
import { SubDepartment } from '../entities/sub-department.entity';
import { AdminExpense } from '../entities/admin-expense.entity';
import { Reimbursement } from '../entities/reimbursement.entity';

dotenv.config();

/* =====================================================
   TYPEORM DATA SOURCE
   ===================================================== */
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [User, Expense, Budget, Department, SubDepartment, AdminExpense, Reimbursement],
  synchronize: false, // ❗ NEVER true in prod
});

/* =====================================================
   SEEDER
   ===================================================== */
async function seedUsers() {
  await AppDataSource.initialize();
  console.log('🟢 Connected to MySQL');

  const userRepo = AppDataSource.getRepository(User);

  /* =====================
     USERS DATA
     ===================== */
  const users = [
    {
      name: 'Kaleem Mohammed',
      password: 'kaleem@dcm',
      role: UserRole.SUPERADMIN,
      userLoc: UserLocation.BENGALURU,
      department: UserDepartment.GENERAL,
      email: 'kalm@demandcurvemarketing.com',
      phone: '8296173336',
    },
    {
      name: 'Kaleem Md',
      password: 'Kal@786',
      role: UserRole.USER,
      userLoc: UserLocation.BENGALURU,
      department: UserDepartment.GENERAL,
      email: 'kaleem@demandcurvemarketing.com',
      phone: '8296173336',
    },
    {
      name: 'Malik Muzammil',
      password: 'muzammil@dcm',
      role: UserRole.SUPERADMIN,
      userLoc: UserLocation.MUMBAI,
      department: UserDepartment.GENERAL,
      email: 'markm@demandcurvemarketing.com',
      phone: '9172460147',
    },
    {
      name: 'Muzamil M',
      password: 'malik@dcm',
      role: UserRole.USER,
      userLoc: UserLocation.MUMBAI,
      department: UserDepartment.IT,
      email: 'malikm@demandcurvemarketing.com',
      phone: '9172460147',
    },
    {
      name: 'Ashraf Ali',
      password: 'ashraf@dcm',
      role: UserRole.USER,
      userLoc: UserLocation.BENGALURU,
      department: UserDepartment.DATA,
      email: 'ashraf.ali@demandcurvemarketing.com',
      phone: '9945836292',
    },
    {
      name: 'Nihal Ahmed',
      password: 'nihal@dcm',
      role: UserRole.USER,
      userLoc: UserLocation.BENGALURU,
      department: UserDepartment.IT,
      email: 'nihal.ahmed@demandcurvemarketing.com',
      phone: '7975417762',
    },
    {
      name: 'Dinesh Kumar',
      password: 'dinesh@dcm',
      role: UserRole.USER,
      userLoc: UserLocation.BENGALURU,
      department: UserDepartment.HR,
      email: 'dinesh.kumar@demandcurvemarketing.com',
      phone: '9663567392',
    },
    {
      name: 'Kannan Jaguya',
      password: 'Kannan@dcm',
      role: UserRole.USER,
      userLoc: UserLocation.MUMBAI,
      department: UserDepartment.HR,
      email: 'kannan.jm@demandcurvemarketing.com',
      phone: '7904591853',
    },
    {
      name: 'Anwar Siddiqui',
      password: 'anwar@dcm',
      role: UserRole.USER,
      userLoc: UserLocation.MUMBAI,
      department: UserDepartment.IT,
      email: 'anwar.siddiqui@demandcurvemarketing.com',
      phone: '7208300986',
    },
    {
      name: 'Waris Ali',
      password: 'waris@dcm',
      role: UserRole.USER,
      userLoc: UserLocation.BENGALURU,
      department: UserDepartment.SALES,
      email: 'waris.ali@demandcurvemarketing.com',
      phone: '7006188016',
    },
    {
      name: 'Syed Fiddarain',
      password: 'fiddu@dcm',
      role: UserRole.USER,
      userLoc: UserLocation.BENGALURU,
      department: UserDepartment.IT,
      email: 'ben.colvin@demandcurvemarketing.com',
      phone: '7899134198',
    },
  ];

  /* =====================
     UPSERT USERS
     ===================== */
  for (const u of users) {
    const existing = await userRepo.findOne({
      where: { email: u.email },
    });

    const hashedPassword = await argon2.hash(u.password);

    if (existing) {
      Object.assign(existing, {
        name: u.name,
        role: u.role,
        userLoc: u.userLoc,
        department: u.department,
        phone: u.phone,
        password: hashedPassword,
      });

      await userRepo.save(existing);
      console.log(`🔁 Updated user: ${u.email}`);
    } else {
      const user = userRepo.create({
        ...u,
        password: hashedPassword,
        spentAmount: 0,
        reimbursedAmount: 0,
        allocatedAmount: 0,
        budgetLeft: 0,
      });

      await userRepo.save(user);
      console.log(`✅ Inserted user: ${u.email}`);
    }
  }

  console.log('🎉 User seeding completed successfully!');
  await AppDataSource.destroy();
}

/* =====================================================
   RUN
   ===================================================== */
seedUsers().catch(async (err) => {
  console.error('❌ User seeding error:', err);
  await AppDataSource.destroy();
  process.exit(1);
});
