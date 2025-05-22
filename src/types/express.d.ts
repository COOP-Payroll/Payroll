export interface AuthUser {
  id: string;
  name: string;
  companyId: string;
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
  companyId:string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// types/express.d.ts or wherever your AuthUser is defined
