export interface GroupParticipant {
  id: string;
  name: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  participantsCount: number;
  isGroup: boolean;
  createdAt: string;
  participants: GroupParticipant[];
}

export interface GetGroupsResponse {
  status: string;
  totalGroups: number;
  groups: Group[];
}

export interface WhatsAppStatus {
  isClientInitialized: boolean;
  isClientAuthenticated: boolean;
  isClientReady: boolean;
  webHelpersInjected: boolean;
  hasQRCode: boolean;
  status: string;
}


export interface WhatsAppContact {
  id: string;
  name: string;
  pushname: string;
  phone: string;
  isBusiness: boolean;
  isVerified: boolean;
  profilePicUrl?: string;
  status?: string;
  isOnline?: boolean;
  lastSeen?: string;
  fromWhatsapp?: boolean;
  email?: string; 
}

export interface GetWhatsAppContactsResponse {
  status: string;
  totalContacts: number;
  contacts: WhatsAppContact[];
}
