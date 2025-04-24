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
  createdAt: string;
}

export enum EventTypeE {
  CreateUser = 'Crear Usuario',
  UpdateUser = 'Actualizar Usuario',
  DeleteUser = 'Eliminar Usuario',
  AssignInstructor = 'Asignar Instructor',
  CreateLink = 'Crear Enlace',
  DeleteLink = 'Eliminar Enlace',
  Login = 'Iniciar Sesión',
  GenerateReport = 'Generar Reporte',
  MarkAssistance = 'Marcar Asistencia',
  UpdateLink = 'Actualizar Enlace',
  DisableDay = 'Deshabilitar Día',
  CreateMeet = 'Crear Reunión',
  DeleteMeet = 'Eliminar Reunión',
  CancelMeet = 'Cancelar Reunión',
  ClickMeet = 'Click en Reunión',
}
