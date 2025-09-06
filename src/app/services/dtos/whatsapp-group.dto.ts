/** Participantes de un grupo de WhatsApp */
export interface WhatsAppParticipant {
  id: string;
  name: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/** Modelo principal de un grupo de WhatsApp */
export interface WhatsAppGroup {
  id: string;
  name: string;
  description: string;
  participantsCount: number;
  isGroup: boolean;
  createdAt: string; // ISO string
  participants: WhatsAppParticipant[];
}

/** Respuesta al obtener todos los grupos */
export interface GetWhatsAppGroupsResponse {
  status: string;
  totalGroups: number;
  groups: WhatsAppGroup[];
}

/* ==================== NUEVO: CONTACTOS DE UN GRUPO ==================== */

/** Payload que se envía al endpoint POST /whatsapp/group-contacts */
export interface GroupContactsRequestDto {
  groupName: string;   // nombre o ID del grupo
  searchById: boolean; // true = usar groupName como ID
}

/** Contacto individual de WhatsApp */
export interface GroupContactDto {
  id: string;
  name: string;
  phone: string;
  pushname: string;
  isBusiness: boolean;
  isVerified: boolean;
  profilePicUrl: string;
  status: string; // estado o descripción del contacto
}

/** Referencia básica del grupo en la respuesta */
export interface GroupRefDto {
  id?: string;
  name?: string;
  description?: string;
  participantsCount?: number;
  isGroup?: boolean;
  isBroadcast?: boolean;
  createdAt?: string;
}

/** Respuesta al obtener contactos de un grupo */
export interface GroupContactsResponseDto {
  status: string;
  group: GroupRefDto;
  contacts: GroupContactDto[];
}