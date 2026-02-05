import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from 'src/entities/budget.entity';
import { User } from 'src/entities/user.entity';
import { Department } from 'src/entities/department.entity';
import { SubDepartment } from 'src/entities/sub-department.entity';
import { Reimbursement } from 'src/entities/reimbursement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Budget,
      User,
      Department,
      SubDepartment,
      Reimbursement
    ])
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     store: await redisStore({
    //       socket: {
    //         host: configService.get("REDIS_HOST") as string,
    //         port: configService.get("REDIS_PORT") as string,
    //       },
    //     }),
    //     ttl: 60,
    //   }),
    // }),
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule { }
