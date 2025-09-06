export interface DiffusionParticipant {
  id?: string;
  name?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export interface DiffusionGroup {
  id: string;
  name: string;
  description: string;
  participantsCount: number;
  isGroup: boolean;
  isBroadcast: boolean;
  createdAt: string;
  participants: DiffusionParticipant[];
}

export interface GetDiffusionGroupsResponse {
  status: string;
  totalDiffusionGroups: number;
  diffusionGroups: DiffusionGroup[];
}

/** Payload que se envía al endpoint POST /whatsapp/diffusion-contacts */
export interface DiffusionContactsRequestDto {
  diffusionName: string;
  searchById: boolean;
}

/** Contacto de una lista de difusión */
export interface DiffusionContactDto {
  id: string;
  name: string;
  phone: string;
  pushname: string;
  isBusiness: boolean;
  isVerified: boolean;
  profilePicUrl: string;
  status: string;
}

/** Referencia liviana de la difusión en la respuesta (Swagger muestra "{}") */
export interface DiffusionRefDto {
  id?: string;
  name?: string;
  description?: string;
  participantsCount?: number;
  isGroup?: boolean;
  isBroadcast?: boolean;
  createdAt?: string;
}

/** Respuesta del endpoint POST /whatsapp/diffusion-contacts */
export interface DiffusionContactsResponseDto {
  status: string;
  diffusion: DiffusionRefDto;
  contacts: DiffusionContactDto[];
}