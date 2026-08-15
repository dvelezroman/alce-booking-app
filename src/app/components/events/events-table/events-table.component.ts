import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  EventTypeE,
  ProcessedEventDto,
} from '../../../services/dtos/process-event-filter.dto';

@Component({
  selector: 'app-events-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './events-table.component.html',
  styleUrl: './events-table.component.scss',
})
export class EventsTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() events: ProcessedEventDto[] = [];
  @Input() loading = false;
  @Input() searchAttempted = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() metadataRequested = new EventEmitter<any>();


  /* =========================
     RESULTS
  ========================= */

  get hasResults(): boolean {
    return this.events.length > 0;
  }

  get showEmptySearch(): boolean {
    return (
      this.searchAttempted &&
      !this.loading &&
      this.events.length === 0
    );
  }


  /* =========================
     TRACK
  ========================= */

  trackByEvent(
    index: number,
    event: ProcessedEventDto,
  ): number {
    return event.id;
  }


  /* =========================
     DATE
  ========================= */

  getEventDate(
    event: ProcessedEventDto,
  ): string {
    if (!event.createdAt) {
      return '—';
    }

    const date = new Date(event.createdAt);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(date);
  }


  getEventTime(
    event: ProcessedEventDto,
  ): string {
    if (!event.createdAt) {
      return '—';
    }

    const date = new Date(event.createdAt);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      },
    ).format(date);
  }


  /* =========================
     EVENT TYPE
  ========================= */

  getEventTypeLabel(
    eventType: EventTypeE,
  ): string {
    const rawType = String(eventType || '').trim();

    if (!rawType) {
      return '—';
    }

    /*
     * El backend actualmente puede devolver la KEY:
     * Login, CreateMeet, CreateUser...
     *
     * mientras EventTypeE contiene los labels:
     * "Iniciar Sesión", "Crear Reunión"...
     */
    const enumLabel =
      EventTypeE[
        rawType as keyof typeof EventTypeE
      ];

    return enumLabel || rawType;
  }


  getEventTypeClass(
    eventType: EventTypeE,
  ): string {
    const type = String(eventType || '').trim();

    switch (type) {

      /* =========================
         LOGIN
      ========================= */

      case 'Login':
        return 'events-table__type--login';


      /* =========================
         USER
      ========================= */

      case 'CreateUser':
      case 'UpdateUser':
      case 'DisableUser':
        return 'events-table__type--user';

      case 'DeleteUser':
        return 'events-table__type--danger';


      /* =========================
         MEETINGS
      ========================= */

      case 'CreateMeet':
      case 'CreateMeetByInstructor':
      case 'AssignInstructor':
      case 'ClickMeet':
        return 'events-table__type--meeting';

      case 'CancelMeet':
      case 'DeleteMeet':
        return 'events-table__type--danger';


      /* =========================
         CONTENT
      ========================= */

      case 'CreateStudyContent':
      case 'UpdateStudyContent':
      case 'AssignStudyContent':
      case 'StudyContentCreated':
      case 'StudyContentUpdated':
      case 'ResourceCreated':
      case 'ResourceEdited':
        return 'events-table__type--content';

      case 'DisableStudyContent':
        return 'events-table__type--warning';

      case 'DeleteStudyContent':
      case 'StudyContentDeleted':
      case 'ResourceDeleted':
        return 'events-table__type--danger';


      /* =========================
         ASSESSMENTS
      ========================= */

      case 'CreateAssessmentTo':
      case 'CreateAssessment':
      case 'UpdateAssessment':
      case 'CreateAssessmentType':
      case 'UpdateAssessmentType':
      case 'UpdateMinAssessmentPoints':
      case 'UpdateMaxAssessmentPoints':
        return 'events-table__type--assessment';

      case 'DeleteAssessment':
      case 'DeleteAssessmentType':
        return 'events-table__type--danger';


      /* =========================
         OTHER
      ========================= */

      case 'GenerateReport':
      case 'MarkAssistance':
      case 'CreateLink':
      case 'UpdateLink':
      case 'DisableDay':
      case 'UpdateStage':
      case 'NotificationCreated':
      case 'NotificationRead':
        return 'events-table__type--other';

      case 'DeleteLink':
        return 'events-table__type--danger';

      default:
        return 'events-table__type--default';
    }
  }


  /* =========================
     DESCRIPTION
  ========================= */

  getDescription(
    event: ProcessedEventDto,
  ): string {
    return (
      event.description?.trim() ||
      'Sin descripción'
    );
  }


  /* =========================
     USER
  ========================= */

  getUserFullName(
    event: ProcessedEventDto,
  ): string {
    /*
     * 1. Primero utilizamos processedBy si realmente
     *    trae nombre y apellido.
     */
    const user = event.processedBy;

    const firstName =
      user?.firstName?.trim() || '';

    const lastName =
      user?.lastName?.trim() || '';

    const fullName = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName) {
      return fullName;
    }

    /*
     * 2. Si el backend no envía processedBy,
     *    intentamos obtenerlo de description.
     */
    return this.getUserNameFromDescription(
      event.description,
      event.eventType,
    );
  }


  getUserInitials(
    event: ProcessedEventDto,
  ): string {
    const name =
      this.getUserFullName(event);

    if (
      !name ||
      name === 'Usuario no disponible'
    ) {
      return 'U';
    }

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    const first =
      parts[0]?.charAt(0) || '';

    const last =
      parts.length > 1
        ? parts[parts.length - 1]?.charAt(0) || ''
        : '';

    return `${first}${last}`
      .toUpperCase();
  }


  getProcessedById(
    event: ProcessedEventDto,
  ): string {
    return event.processedById
      ? `ID: ${event.processedById}`
      : '—';
  }


  /* =========================
     USER FROM DESCRIPTION
  ========================= */

  private getUserNameFromDescription(
    description: string | null | undefined,
    eventType?: EventTypeE,
  ): string {
    if (!description?.trim()) {
      return 'Usuario no disponible';
    }

    const text =
      description
        .replace(/\s+/g, ' ')
        .trim();

    const type =
      String(eventType || '').trim();


    /* =========================
       FORMAT:
       Usuario: username, Nombre Apellido, acción...
    ========================= */

    const usuarioMatch = text.match(
      /^Usuario:\s*([^,]+),\s*(.+?)(?:,\s*(?:inicio|inició|actualizó|eliminó|creó|marcó|generó|asignó|deshabilitó|canceló|hizo|click)\b|$)/i,
    );

    if (usuarioMatch) {
      const username =
        usuarioMatch[1]?.trim() || '';

      const name =
        usuarioMatch[2]?.trim() || '';

      return (
        name ||
        username ||
        'Usuario no disponible'
      );
    }


   /* =========================
      CREATE MEET
    ========================= */

    if (
      type === 'CreateMeet' ||
      type === 'CreateMeetByInstructor'
    ) {
      const firstPart = text
        .split(',')[0]
        ?.trim();

      if (firstPart) {
        return firstPart;
      }
    }


    /* =========================
       GENERIC ENGLISH ACTION

       Apellido, Nombre, created...
       Apellido, Nombre, updated...
       Apellido, Nombre, deleted...
       Apellido, Nombre, assigned...
       etc.
    ========================= */

    const englishActionMatch =
      text.match(
        /^([^,]+),\s*([^,]+),\s*(?:created|updated|deleted|assigned|disabled|cancelled|canceled|generated|marked|clicked|started|changed|edited|removed)\b/i,
      );

    if (englishActionMatch) {
      const lastName =
        englishActionMatch[1]?.trim() || '';

      const firstName =
        englishActionMatch[2]?.trim() || '';

      const name = [
        firstName,
        lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (name) {
        return name;
      }
    }


    /* =========================
       GENERIC SPANISH ACTION

       Apellido, Nombre, creó...
       Apellido, Nombre, actualizó...
       etc.
    ========================= */

    const spanishActionMatch =
      text.match(
        /^([^,]+),\s*([^,]+),\s*(?:creó|actualizó|eliminó|asignó|deshabilitó|canceló|generó|marcó|inició|modificó|editó)\b/i,
      );

    if (spanishActionMatch) {
      const lastName =
        spanishActionMatch[1]?.trim() || '';

      const firstName =
        spanishActionMatch[2]?.trim() || '';

      const name = [
        firstName,
        lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (name) {
        return name;
      }
    }


    /* =========================
       USER + ID ONLY

       Ejemplo:
       User 618 marked notification...
       
       Aquí NO tenemos nombre,
       por lo tanto no inventamos uno.
    ========================= */

    if (
      /^User\s+\d+\b/i.test(text)
    ) {
      return 'Usuario no disponible';
    }


    /* =========================
       FALLBACK
    ========================= */

    return 'Usuario no disponible';
  }


  /* =========================
     METADATA
  ========================= */

  hasMetadata(
    event: ProcessedEventDto,
  ): boolean {
    const metadata =
      event.metadata;

    return !!(
      metadata &&
      metadata !== 'null'
    );
  }


  onViewMetadata(
    event: ProcessedEventDto,
  ): void {
    this.metadataRequested.emit(
      event.metadata,
    );
  }


  /* =========================
     EVENT TYPE HELPERS
  ========================= */

  isLoginEvent(
    event: ProcessedEventDto,
  ): boolean {
    return (
      String(event.eventType) ===
      'Login'
    );
  }


  isUserEvent(
    event: ProcessedEventDto,
  ): boolean {
    const types = [
      'CreateUser',
      'UpdateUser',
      'DeleteUser',
      'DisableUser',
    ];

    return types.includes(
      String(event.eventType),
    );
  }


  isMeetingEvent(
    event: ProcessedEventDto,
  ): boolean {
    const types = [
      'CreateMeet',
      'DeleteMeet',
      'CancelMeet',
      'ClickMeet',
      'CreateMeetByInstructor',
      'AssignInstructor',
    ];

    return types.includes(
      String(event.eventType),
    );
  }


  isContentEvent(
    event: ProcessedEventDto,
  ): boolean {
    const types = [
      'CreateStudyContent',
      'UpdateStudyContent',
      'DisableStudyContent',
      'DeleteStudyContent',
      'AssignStudyContent',
      'StudyContentCreated',
      'StudyContentUpdated',
      'StudyContentDeleted',
      'ResourceCreated',
      'ResourceEdited',
      'ResourceDeleted',
    ];

    return types.includes(
      String(event.eventType),
    );
  }


  /* =========================
     PROTECTED
  ========================= */

  protected readonly EventTypeE =
    EventTypeE;
}