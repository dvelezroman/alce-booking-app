export interface WhatsappContentTemplate {
  id: number;
  name: string;
  body: string;
  createdById?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWhatsappContentTemplateDto {
  name: string;
  body: string;
}

export interface UpdateWhatsappContentTemplateDto {
  name?: string;
  body?: string;
}
