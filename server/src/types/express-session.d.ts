import 'express-session';
import { User } from 'src/entities/user.entity'
import { UserRole } from 'src/enums/user.enum';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    deviceId?: string;
    role?: string;
    user?: {
      id?: string;
      role?: UserRole
      name?: string
    };
    twoFactorSecret?: string;
    twoFactorPending?: boolean;
    twoFactorVerified?: boolean;
    authenticated?: boolean;
  }
}
