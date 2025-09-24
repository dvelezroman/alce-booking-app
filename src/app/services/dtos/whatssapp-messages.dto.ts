
export interface WhatsAppMessage {
  id: number;
  messageId: string;
  recipientType: 'INDIVIDUAL' | 'GROUP' | 'BROADCAST';
  recipientId: string;
  recipientName: string;
  message: string;
  quantity: number;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetWhatsAppMessagesResponse {
  status: string;
  totalMessages: number;
  page: number;
  limit: number;
  totalPages: number;
  messages: WhatsAppMessage[];
}

export interface GetWhatsAppMessagesFilters {
  page?: number;
  limit?: number;
  status?: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | '';
  recipientType?: 'INDIVIDUAL' | 'GROUP' | 'BROADCAST';
  recipientName?: string;
  recipientId?: string;
  sentAtFrom?: string;
  sentAtTo?: string; 
}

export interface GetWhatsAppDailyUsageResponse {
  messagesUsed: number;
  messagesRemaining: number;
  limit: number;
  date: string;
}