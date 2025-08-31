import { UserDto } from './user.dto';
import { Stage } from './student.dto';

export interface Notification {
  id: number;
  from: number;
  fromUser: UserDto;
  to: number[];
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
  readBy: number[]; 
  expiresAt?: string;
  metadata?: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
  errorMessage?: string;
}

export interface NotificationMessage {
  body: string;
  action?: string;
  meetingId?: number;
  [key: string]: any;
}

export interface CreateNotificationDto {
  to: number[];
  scope: 'INDIVIDUAL' | 'ALL_USERS' | 'ALL_STUDENTS' | 'ALL_INSTRUCTORS' | 'STAGE_STUDENTS';
  stageId?: number;
  title: string;
  message: NotificationMessage
  notificationType: NotificationTypeEnum;
  priority: number;
  scheduledAt?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  maxRetries?: number;
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