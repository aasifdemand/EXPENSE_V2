import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';
import { MailService } from 'src/services/mail.service';
import { TypeOrmModule } from "@nestjs/typeorm"
import { Expense } from 'src/entities/expense.entity';
import { User } from 'src/entities/user.entity';
import { Budget } from 'src/entities/budget.entity';
import { Department } from 'src/entities/department.entity';
import { SubDepartment } from 'src/entities/sub-department.entity';
import { Reimbursement } from 'src/entities/reimbursement.entity';
import { DateUtil } from 'src/utils/date.util';
import { AdminExpense } from 'src/entities/admin-expense.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forFeature([Expense, User, Budget, Department, SubDepartment, Reimbursement, AdminExpense]),
    NotificationsModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get("REDIS_HOST") as string,
            port: configService.get("REDIS_PORT") as string,
          },
        }),
        ttl: 60,
      }),
    }),

  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, NotificationsService, NotificationsGateway, MailService, DateUtil],
  exports: [NotificationsService, NotificationsGateway, MailService],
})
export class ExpensesModule { }
