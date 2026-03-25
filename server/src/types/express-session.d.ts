import 'express-session';
import { UserRole } from 'src/enums/user.enum';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    deviceId?: string;
    role?: string;
    user?: {
      id?: string;
      role?: UserRole;
      name?: string;
    };
    twoFactorSecret?: string | null;
    twoFactorPending?: boolean;
    twoFactorVerified?: boolean;
    authenticated?: boolean;
  }
}
