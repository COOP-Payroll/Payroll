export interface AuthUser {
  id: string;
  name: string;
  companyId: string;
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
