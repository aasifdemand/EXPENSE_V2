import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BudgetModule } from './budget/budget.module';
import { NotificationsGateway } from './gateways/notifications/notifications.gateway';
import { DepartmentModule } from './department/department.module';
import { ReimbursementModule } from './reimbursement/reimbursement.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TypeOrmModule } from "@nestjs/typeorm"
import { ServeStaticModule } from '@nestjs/serve-static';
import path, { join } from 'path';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        maxAge: '1d',
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("MYSQL_HOST"),
        port: configService.get("MYSQL_PORT") as number,
        username: configService.get("MYSQL_USER"),
        password: configService.get("MYSQL_PASSWORD"),
        database: configService.get("MYSQL_DATABASE"),
        entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: configService.get("NODE_ENV") === "development"
      })
    }),
    AuthModule,
    ExpensesModule,
    BudgetModule,
    DepartmentModule,
    ReimbursementModule,
    NotificationsModule
  ],
  controllers: [],
  providers: [NotificationsGateway],
})
export class AppModule { }
