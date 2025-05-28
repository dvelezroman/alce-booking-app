export interface ProcessedEventFilterDto {
  eventType?: EventTypeE;
  from?: string;
  to?: string;
  processedById?: number;
  sort?: 'asc' | 'desc';
  search?: string;
}
export interface EventUserDataI {
  firstName: string;
  lastName: string;
}
export interface ProcessedEventDto {
  id: number;
  processedById: number;
  processedBy: EventUserDataI;
  eventType: EventTypeE;
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
