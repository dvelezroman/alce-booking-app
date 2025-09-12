import { Group } from './whatsapp-group.dto';
import { DiffusionGroup } from './whatsapp-diffusion-group.dto';

/** ====== CONTACTO ====== */
export interface SendContactMessageDto {
  phone: string;
  message: string;
}

export interface SendContactMessageResponse {
  status: string;
  phone: string;
  contactName: string;
  message: string;
  sentAt: string;
  scheduledFor?: string;
  error?: string;
}

/** ====== GRUPO ====== */
export interface SendGroupMessageDto {
  groupName: string;
  message: string;
  searchById: boolean;
}

export interface SendGroupMessageResponse {
  status: string;
  group: Pick<Group, 'id' | 'name' | 'participantsCount'>;
  message: string;
  sentAt: string;
}

/** ====== DIFUSIÓN ====== */
export interface SendDiffusionMessageDto {
  groupName: string;
  message: string;
  searchById: boolean;
}

export interface SendDiffusionMessageResponse {
  status: string;
  group: Pick<DiffusionGroup, 'id' | 'name' | 'participantsCount'>; 
  message: string;
  sentAt: string;
}