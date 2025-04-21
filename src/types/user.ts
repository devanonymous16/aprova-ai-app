
export type UserRole = 'visitor' | 'student' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string; // Para estudantes B2B e gerentes
  avatarUrl?: string;
  isB2BStudent?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  active: boolean;
  createdAt: Date;
}
