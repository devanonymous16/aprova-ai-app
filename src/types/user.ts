export type UserRole = 'student' | 'manager' | 'admin' | 'visitor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string; // Para estudantes B2B e gerentes
  unitId?: string; // Para estudantes associados a uma unidade específica
  avatarUrl?: string;
  isB2BStudent?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  document: string; // CNPJ ou outro documento
  addressId: string;
  logoUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string; // Normalmente Managers
  permissions: object; // JSON com permissões específicas
  createdAt: Date;
}

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  themeConfig: object; // JSON com configurações de tema
  accessConfig: object; // JSON com configurações de acesso
  notificationConfig: object; // JSON com configurações de notificação
  updatedAt: Date;
}

export interface Student {
  id: string; // FK para auth.users.id
  organizationId?: string; // FK para organizations.id (opcional para B2B)
  unitId?: string; // FK para units.id (opcional)
  name: string;
  email: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  documents?: object; // JSON com documentos como CPF, RG, etc.
  confirmed: boolean;
  confirmationToken?: string;
  confirmationSentAt?: Date;
  resetToken?: string;
  resetSentAt?: Date;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Manager {
  id: string; // FK para auth.users.id
  name: string;
  email: string;
  permissions: object; // JSON com permissões específicas
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string; // FK para auth.users.id
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: 'ESSENCIAL' | 'UNLIMITED' | 'ENTERPRISE';
  targetAudience: 'B2C' | 'B2B';
  description: string;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanFeature {
  id: string;
  planId: string;
  featureKey: string;
  description: string;
  limit?: object; // JSON com limites numéricos, se aplicável
}

export interface EducationLevel {
  id: string;
  name: string;
  order: number;
}

export interface PricingTier {
  id: string;
  planId: string;
  educationLevelId?: string;
  priceAnnual: number;
  priceMonthlyInstallments: number;
  stripePriceIdAnnual: string;
  stripePriceIdMonthly?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamInstitution {
  id: string;
  name: string;
  acronym: string;
}

export interface ExamPosition {
  id: string;
  name: string;
  examInstitutionId: string;
  educationLevelId: string;
}

export interface Exam {
  id: string;
  examPositionId: string;
  year: number;
  examDate?: Date;
  status: string; // 'upcoming', 'active', 'completed', etc.
  detailsUrl: string;
  examStyleId?: string; // Para bancas como CESPE, FCC, etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  studentId: string;
  planId: string;
  pricingTierId?: string;
  examPositionId?: string;
  stripeSubscriptionId: string;
  status: string; // 'active', 'canceled', 'past_due', etc.
  amount: number;
  startDate: Date;
  endDate: Date;
  stripeCancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentExam {
  id: string;
  studentId: string;
  examId: string;
  examPositionId: string;
  subscriptionId?: string;
  accessType: string; // 'free', 'subscription', 'purchase', etc.
  accessGrantedAt: Date;
  accessExpiresAt?: Date;
}

export interface StudyPlan {
  id: string;
  studentId: string;
  examPositionId: string;
  diagnosisId?: string;
  planData: object; // JSON com cronograma gerado pela IA
  isActive: boolean;
  source: string; // 'system', 'ai', 'manual', etc.
  createdAt: Date;
  updatedAt: Date;
}
