import { UserDto } from './user.dto';
import { Stage, StudentClassification } from './student.dto';

export interface Notification {
  id: number;
  from: number;
  fromUser: UserDto;
  to: UserDto[];
  scope: 'INDIVIDUAL' | 'ALL_USERS' | 'ALL_STUDENTS' | 'ALL_INSTRUCTORS' | 'STAGE_STUDENTS';
  stageId?: number;
  stage?: Stage;
  title: string;
  message: NotificationMessage;
  notificationType: 'Announce' | 'Advice' | 'Commentary' | 'Mandatory' | 'System' | 'Meeting' | 'Assessment';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  priority: number;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string | null;
  readBy: number[]; 
  expiresAt?: string;
  metadata?: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
  errorMessage?: string;
  isRead?: boolean;
}

export interface NotificationMessage {
  body: string;
  action?: string;
  meetingId?: number;
  kind?: 'demo-class' | 'S2S_NEW_STUDENTS_TO_CREATE' | string;
  lead?: DemoClassLead;
  rows?: NewStudentRow[];
  summary?: NotificationSummary | DemoClassSummary;
  [key: string]: any;
}

export interface DemoClassLead {
  firstName: string;
  lastName: string;
  email: string;
  idNumber: string;
  contactPhone: string;
  courtesyClassHours: number;
  stageId: number;
  stageNumber: string;
  stageLabel: string;
  stageDescription: string;
  requestingAdvisorName: string;
  requestingAdvisorEmail: string;
  requestingAdvisorPhone: string;
  requestingAdvisorSedeLabel: string;
}

export interface DemoClassSummary {
  stageId: number;
  leadName: string;
  courtesyClassHours: number;
}

export interface NotificationSummary {
  count: number;
}

export interface NewStudentRow {
  index: number;

  // Usuario / acceso
  email: string;
  password?: string;

  // Datos personales
  firstName: string;
  lastName: string;
  idNumber?: string;
  birthday?: string;

  // Contacto
  emailAddress?: string;
  contact?: string;
  country?: string;
  city?: string;

  // Información general
  occupation?: string;
  mode: 'ONLINE' | 'PRESENCIAL' | 'SEMIPRESENCIAL';

  // Información académica
  stageId?: number;
  stageLabel?: string;
  studentClassification: 'KIDS' | 'TEENS' | 'ADULTS';
  startClassDate?: string;
  endClassDate?: string;

  // Representante
  tutorName?: string;
  tutorEmail?: string;
  tutorPhone?: string;

  // Contrato / límites
  contractNumber?: string;
  maxSchedulingStage?: number;

  // Campos opcionales de programa, si los siguen usando en notificación/listado
  contractProgramType?: string;
  contractProgramLabel?: string;
  studyProgramName?: string;
  studyProgramCode?: string;
  studyProgramDurationMonths?: number;
  studyProgramDurationLabel?: string;
  studyProgramComment?: string;
}

export interface CreateStudentWithUserDto {
  email: string;
  password: string;

  firstName: string;
  lastName: string;
  idNumber?: string;
  birthday?: string;

  emailAddress?: string;
  contact?: string;
  country?: string;
  city?: string;
  occupation?: string;

  mode: 'ONLINE' | 'PRESENCIAL' | 'SEMIPRESENCIAL';
  stageId?: number;
  studentClassification: 'KIDS' | 'TEENS' | 'ADULTS';

  startClassDate?: string;
  endClassDate?: string;

  tutorName?: string;
  tutorEmail?: string;
  tutorPhone?: string;

  contractNumber?: string;
  maxSchedulingStage?: number;

  contractProgramType?: string;
  contractProgramLabel?: string;
  studyProgramName?: string;
  studyProgramCode?: string;
  studyProgramDurationMonths?: number;
  studyProgramDurationLabel?: string;
  studyProgramComment?: string;
}

export interface CreateNotificationDto {
  from: number;
  to: number[];
  scope: 'INDIVIDUAL' | 'ALL_USERS' | 'ALL_STUDENTS' | 'ALL_INSTRUCTORS' | 'STAGE_STUDENTS';
  stageId?: number;
  studentClassification?: StudentClassification;
  city?: string;
  title: string;
  message: NotificationMessage
  notificationType: NotificationTypeEnum;
  priority: number;
  scheduledAt?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  maxRetries?: number;
  isPersistent?: boolean;
  isDeletable?: boolean;
  isTemporal?: boolean;
  temporalWindowType?: 'FIXED_DAYS' | 'ROLLING';
  temporalWindowValue?: number;
  temporalWindowStart?: string;
  temporalWindowEnd?: string;
  temporalStageId?: number;
}

export interface CreateNotificationsBulkDto {
  notifications: CreateNotificationDto[];
}

export interface FilterNotificationDto {
  notificationType?: Notification['notificationType'];
  scope?: Notification['scope'];
  status?: Notification['status'];
  priority?: number;
  userId?: number;
  fromUserId?: number;
  fromDate?: string;
  toDate?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export enum NotificationScopeEnum {
  INDIVIDUAL = 'INDIVIDUAL',
  ALL_USERS = 'ALL_USERS',
  ALL_STUDENTS = 'ALL_STUDENTS',
  ALL_INSTRUCTORS = 'ALL_INSTRUCTORS',
  STAGE_STUDENTS = 'STAGE_STUDENTS',
  ALL_ADMINS = 'ALL_ADMINS', 
}

export enum NotificationTypeEnum {
  Announce = 'Announce',
  Advice = 'Advice',
  Commentary = 'Commentary',
  Mandatory = 'Mandatory',
  System = 'System',
  Meeting = 'Meeting',
  Assessment = 'Assessment',
}
export type NotificationType = keyof typeof NotificationTypeEnum;

export interface CreateNotificationGroupDto {
  name: string;
  description: string;
  userIds: number[];
}

export interface NotificationGroupDto {
  id: number;
  name: string;
  description: string;
  userIds: number[];
  createdAt: string;
  updatedAt: string;
  users: UserDto[];
}

export interface FilterNotificationGroupDto {
  name?: string;
  description?: string;
  userId?: number;
  page?: number;
  limit?: number;
}

export interface NotificationGroupListResponse {
  notificationGroups: NotificationGroupDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// bandeja de entrada
export interface InboxFilters {
  search?: string;
  status?: 'SENT' | 'PENDING' | 'DELIVERED' | 'READ' | 'FAILED' | '';
  type?: Notification['notificationType'] | '';
  scope?: Notification['scope'] | '';
  fromDate?: string;
  toDate?: string;
  priority?: 0 | 1 | 2 | 3 | '';
  readState?: 'all' | 'unread' | 'read';
}