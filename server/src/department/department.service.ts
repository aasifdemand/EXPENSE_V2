import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from 'src/entities/department.entity';
import { SubDepartment } from 'src/entities/sub-department.entity';

@Injectable()
export class DepartmentService {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepo: Repository<Department>,

        @InjectRepository(SubDepartment)
        private readonly subDepartmentRepo: Repository<SubDepartment>,
    ) { }

    /* =====================
       FETCH ALL DEPARTMENTS
       ===================== */
    async fetchAllDepartments() {
        const departments = await this.departmentRepo.find({
            order: { createdAt: 'ASC' },
        });

        return { departments };
    }

    /* =====================
       FETCH ALL SUB-DEPARTMENTS
       ===================== */
    async fetchAllSubdepartments() {
        const subDepartments = await this.subDepartmentRepo.find({
            relations: ['department'],
            order: { createdAt: 'ASC' },
        });

        return { subDepartments };
    }

    /* =====================
       FETCH SUB-DEPARTMENTS BY DEPARTMENT ID
       ===================== */
    async fetchSubdepartmentsById(deptId: string) {
        const department = await this.departmentRepo.findOneBy({ id: deptId });
        if (!department) {
            throw new NotFoundException('Department not found');
        }

        const subDepartments = await this.subDepartmentRepo.find({
            where: {
                department: { id: deptId },
            },
            order: { createdAt: 'ASC' },
        });

        return { subDepartments };
    }
}
