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
  metadata?: any;
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
  CreateStudyContent = 'Crear contenido',
  UpdateStudyContent = 'Actualizar contenido',
  DisableStudyContent = 'Deshabilitar contenido',
  DeleteStudyContent = 'Eliminar contenido',
  AssignStudyContent = 'Asignar contenido',
  CreateAssessmentTo = 'Crear evaluación a estudiante',
  UpdateMinAssessmentPoints = 'Actualizar nota mínima',
  UpdateMaxAssessmentPoints = 'Actualizar nota máxima',
  StudyContentCreated = 'Contenido creado',
  StudyContentUpdated = 'Contenido actualizado',
  StudyContentDeleted = 'Contenido eliminado',
  CreateMeetByInstructor = 'Clase creada por instructor',
  CreateAssessment = 'Evaluación creada',
  UpdateAssessment = 'Evaluación actualizada',
  DeleteAssessment = 'Evaluación eliminada',
  UpdateStage = 'Cambio de etapa',
  NotificationCreated = 'Notificación creada',
  NotificationRead = 'Notificación leída',
  ResourceCreated = 'Recurso creado',
  ResourceEdited = 'Recurso editado',
  ResourceDeleted = 'Recurso eliminado',
  DisableUser = 'Usuario deshabilitado',
  CreateAssessmentType = 'Tipo de evaluación creado',
  UpdateAssessmentType = 'Tipo de evaluación actualizado',
  DeleteAssessmentType = 'Tipo de evaluación eliminado'
}
