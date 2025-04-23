export interface ProcessedEventFilterDto {
  eventType?: string;
  from?: string;
  to?: string;
  processedById?: number;
  sort?: 'asc' | 'desc';
}

export interface ProcessedEventDto {
  id: number;
  processedById: number;
  eventType: string;
  description: string;
}