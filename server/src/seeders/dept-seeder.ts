import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { Department } from '../entities/department.entity';
import { SubDepartment } from '../entities/sub-department.entity';

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
    entities: [Department, SubDepartment],
    synchronize: false, // ❗ NEVER true in prod
});

/* =====================================================
   SEEDER
   ===================================================== */
async function runSeeder() {
    await AppDataSource.initialize();
    console.log('🟢 Connected to MySQL');

    const departmentRepo = AppDataSource.getRepository(Department);
    const subDepartmentRepo = AppDataSource.getRepository(SubDepartment);

    /* =====================
       DEPARTMENTS
       ===================== */
    const departments = ['Sales', 'Office', 'Data', 'IT'];
    const deptMap = new Map<string, Department>();

    for (const name of departments) {
        let dept = await departmentRepo.findOne({ where: { name } });

        if (!dept) {
            dept = departmentRepo.create({ name });
            await departmentRepo.save(dept);
            console.log(`✅ Inserted Department: ${name}`);
        } else {
            console.log(`⚠️ Department already exists: ${name}`);
        }

        deptMap.set(name, dept);
    }

    /* =====================
       SUB-DEPARTMENTS
       ===================== */
    const subDepartmentsData: Record<string, string[]> = {
        Sales: [
            'G-Suite',
            'Instantly',
            'Domain',
            'Contabo',
            'Linkedin',
            'Vendor G-Suite',
            'Vendor Outlook',
            'VPN',
            'Zoom Calling',
            'Ai Ark',
            'Others',
        ],
        Office: [
            'APNA',
            'Naukri',
            'Milk Bill/Tea etc.',
            'Cake',
            'Electricity Bill',
            'Swiggy/Blinkit',
            'Office Rent',
            'Office Maintenance',
            'Stationary',
            'Courier Charges',
            'Salaries',
            'Salary Arrears',
            'Incentive',
            'Incentive Arrears',
            'Internet Bill',
            'Office Repairs & Butification',
            'Chairs Purchase',
            'Goodies/Bonuses/Bonanza',
            'Event Exp',
            'Cricket',
            'Trainings',
            'Employee Insurance',
            'ID Cards',
            'Laptop',
            'Desktop',
            'System Peripherals',
            'Others',
        ],
        Data: [
            'Apollo',
            'Linkedin',
            'Email Verifier',
            'Zoominfo',
            'VPN',
            'Ai Ark',
            'Domain',
            'Others',
        ],
        IT: [
            'Servers',
            'Domain',
            'Zoho',
            'Instantly',
            'Real Cloud',
            'Others',
        ],
    };

    for (const [deptName, subDeps] of Object.entries(subDepartmentsData)) {
        const department = deptMap.get(deptName);
        if (!department) continue;

        for (const subName of subDeps) {
            const exists = await subDepartmentRepo.findOne({
                where: {
                    name: subName,
                    department: { id: department.id },
                },
            });

            if (!exists) {
                const subDept = subDepartmentRepo.create({
                    name: subName,
                    department,
                });

                await subDepartmentRepo.save(subDept);
                console.log(`✅ Inserted SubDepartment: ${subName} under ${deptName}`);
            } else {
                console.log(`⚠️ Skipped (already exists): ${subName}`);
            }
        }
    }

    console.log('🎉 Seeding completed successfully!');
    await AppDataSource.destroy();
}

/* =====================================================
   RUN
   ===================================================== */
runSeeder().catch(async (err) => {
    console.error('❌ Seeding error:', err);
    await AppDataSource.destroy();
    process.exit(1);
});
