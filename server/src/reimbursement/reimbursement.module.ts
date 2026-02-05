import { Module } from '@nestjs/common';
import { ReimbursementService } from './reimbursement.service';
import { ReimbursementController } from './reimbursement.controller';
import { NotificationsGateway } from 'src/gateways/notifications/notifications.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reimbursement } from 'src/entities/reimbursement.entity';
import { User } from 'src/entities/user.entity';
import { Expense } from 'src/entities/expense.entity';
import { Budget } from 'src/entities/budget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reimbursement, User, Expense, Budget]),
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
  controllers: [ReimbursementController],
  providers: [ReimbursementService, NotificationsGateway, NotificationsService],
  exports: [NotificationsGateway, NotificationsService]
})
export class ReimbursementModule { }
