import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  Router,
  RouterModule,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  CreateStudentWithUserDto,
  DemoClassLead,
  DemoClassSummary,
  LeadSchedulingAssignedSummary,
  LeadSchedulingNotificationRequestKind,
  NewStudentRow,
  Notification,
} from '../../../../services/dtos/notification.dto';
import {
  UserDto,
  UserRole,
} from '../../../../services/dtos/user.dto';
import {
  Stage,
} from '../../../../services/dtos/student.dto';

import {
  selectUserData,
} from '../../../../store/user.selector';

import {
  UsersService,
} from '../../../../services/users.service';
import {
  NotificationService,
} from '../../../../services/notification.service';
import {
  StagesService,
} from '../../../../services/stages.service';
import {
  StudentsService,
} from '../../../../services/students.service';

import {
  ModalComponent,
} from '../../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../../components/modal/modal.dto';

import {
  StudentEditModalComponent,
} from '../../../../components/notifications/student-edit-modal/student-edit-modal.component';

import {
  SafeNoteHtmlPipe,
} from '../../../../pipes/safe-note-html.pipe';

import {
  sanitizeNotificationBody,
} from '../../../../shared/utils/notification-message.util';
import {
  isPlacementTestExam,
} from '../../../../shared/utils/lead-scheduling-request.util';
import { NotificationDetailActionsComponent } from '../../../../components/notifications/notification-detail/notification-detail-actions/notification-detail-actions.component';
import { NotificationDetailAttachmentsComponent } from '../../../../components/notifications/notification-detail/notification-detail-attachments/notification-detail-attachments.component';
import { NotificationDetailContentComponent } from '../../../../components/notifications/notification-detail/notification-detail-content/notification-detail-content.component';
import { NotificationDetailErrorComponent } from '../../../../components/notifications/notification-detail/notification-detail-error/notification-detail-error.component';
import { NotificationDetailHeaderComponent } from '../../../../components/notifications/notification-detail/notification-detail-header/notification-detail-header.component';
import { NotificationDetailInfoComponent } from '../../../../components/notifications/notification-detail/notification-detail-info/notification-detail-info.component';
import { NotificationDetailLoadingComponent } from '../../../../components/notifications/notification-detail/notification-detail-loading/notification-detail-loading.component';

/* COMPONENTES HIJOS */


@Component({
  selector: 'app-notification-detail-v2',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    ModalComponent,
    SafeNoteHtmlPipe,
    StudentEditModalComponent,

    NotificationDetailHeaderComponent,
    NotificationDetailContentComponent,
    NotificationDetailInfoComponent,
    NotificationDetailActionsComponent,
    NotificationDetailAttachmentsComponent,
    NotificationDetailLoadingComponent,
    NotificationDetailErrorComponent,
  ],
  templateUrl: './notification-detail-v2.component.html',
  styleUrls: [ './notification-detail-v2.component.scss',
  ],
})
export class NotificationDetailV2Component
  implements OnInit, OnDestroy
{
  notification?: Notification;
  toDisplayName = '';
  userRole: UserRole | null = null;

  protected readonly UserRole = UserRole;

  stages: Stage[] = [];
  studentToEdit: NewStudentRow | null = null;
  showStudentEditModal = false;
  openStudentMenuIndex: number | null = null;
  studentMenuPosition = {
    top: 0,
    left: 0,
  };

  modal: ModalDto = modalInitializer();
  deleting = false;
  showAllRecipients = false;
  currentUserId?: number;
  showRecipients = false;

  private origin:
    | 'inbox'
    | 'sent'
    | 'status'
    | 'unknown' = 'unknown';

  private readonly destroy$ =
    new Subject<void>();

  private readonly statusEs: Record<
    Notification['status'],
    string
  > = {
    PENDING: 'Pendiente',
    SENT: 'Enviada',
    DELIVERED: 'Entregada',
    READ: 'Leída',
    FAILED: 'Fallida',
  };

  private readonly typeEs: Record<
    Notification['notificationType'],
    string
  > = {
    Announce: 'Anuncio',
    Advice: 'Aviso',
    Commentary: 'Comentario',
    Mandatory: 'Obligatoria',
    System: 'Sistema',
    Meeting: 'Reunión',
    Assessment: 'Evaluación',
  };

  private static readonly leadSchedulingStatusEs:
    Record<string, string> = {
      PENDING: 'Pendiente de agendar',
      SCHEDULED: 'Agendada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Completada',
    };

  estadoLabel = '—';

  tipoLabel = '—';

  prioridadLabel = '—';

  constructor(
    private readonly store: Store,
    private readonly router: Router,
    private readonly location: Location,
    private readonly cdr: ChangeDetectorRef,
    private readonly usersService:
      UsersService,
    private readonly stagesService:
      StagesService,
    private readonly studentsService:
      StudentsService,
    private readonly notificationService:
      NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadStages();
    this.loadNotificationFromState();
    this.listenCurrentUser();
  }

  private loadStages(): void {
    this.stagesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stages) => {
          this.stages =
            this.filterAndSortStages(stages);
        },
        error: () => {
          this.stages = [];
        },
      });
  }

  private loadNotificationFromState(): void {
    const state = history.state as {
      notification?: Notification;
      origin?:
        | 'inbox'
        | 'sent'
        | 'status';
    };

    if (!state?.notification) {
      void this.router.navigate([
        '/dashboard/notifications-inbox',
      ]);

      return;
    }

    this.notification = state.notification;

    this.origin =
      state.origin ?? 'unknown';

    this.estadoLabel =
      this.statusEs[
        this.notification.status
      ] ?? '—';

    this.tipoLabel =
      this.typeEs[
        this.notification.notificationType
      ] ?? '—';

    this.prioridadLabel =
      this.priorityEs(
        this.notification.priority,
      );

    /*
     * Nunca se muestran destinatarios cuando
     * la notificación viene desde recibidas.
     */
    this.showRecipients =
      this.notification.scope ===
        'INDIVIDUAL' &&
      this.origin !== 'inbox';
  }

  private listenCurrentUser(): void {
    this.store
      .select(selectUserData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (user: UserDto | null) => {
          if (user) {
            this.applyUser(user);
            return;
          }

          const token =
            typeof window !== 'undefined'
              ? localStorage.getItem(
                  'accessToken',
                )
              : null;

          if (!token) {
            return;
          }

          this.usersService
            .refreshLogin()
            .pipe(
              takeUntil(this.destroy$),
            )
            .subscribe({
              next: (refreshedUser) => {
                this.applyUser(
                  refreshedUser,
                );
              },
              error: () => {
                // No se modifica el estado.
              },
            });
        },
      );
  }

  private filterAndSortStages(
    stages: Stage[],
  ): Stage[] {
    return stages
      .filter((stage) => {
        const description =
          stage.description.toUpperCase();

        return (
          !description.startsWith(
            'K-STG',
          ) &&
          description !== 'STAGE 1.0'
        );
      })
      .sort((first, second) => {
        const getNumber = (
          description: string,
        ): number => {
          const match =
            description.match(
              /\d+(\.\d+)?/,
            );

          return match
            ? Number.parseFloat(match[0])
            : 0;
        };

        return (
          getNumber(first.description) -
          getNumber(second.description)
        );
      });
  }

  private priorityEs(
    priority?: number,
  ): string {
    if (priority === 0) {
      return 'Baja';
    }

    if (priority === 1) {
      return 'Media';
    }

    if (priority === 2) {
      return 'Alta';
    }

    if (priority === 3) {
      return 'Urgente';
    }

    return '—';
  }

  private scopeLabel(
    scope?: string,
  ): string {
    switch (scope) {
      case 'ALL_USERS':
        return 'Todos los usuarios';

      case 'ALL_STUDENTS':
        return 'Todos los estudiantes';

      case 'ALL_INSTRUCTORS':
        return 'Todos los instructores';

      case 'INDIVIDUAL':
        return 'Individual';

      case 'STAGE_STUDENTS':
        return 'Estudiantes por etapa';

      default:
        return scope || '';
    }
  }

  private applyUser(
    user: UserDto,
  ): void {
    this.currentUserId = user.id;

    this.userRole =
      user.role ?? null;

    const fullName = [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    this.toDisplayName =
      fullName || user.email || '';

    /*
     * Solo ADMIN puede ver los destinatarios
     * y nunca desde la bandeja recibida.
     */
    this.showRecipients =
      this.showRecipients &&
      this.userRole === UserRole.ADMIN;

    this.cdr.markForCheck();
  }

  get isAdmin(): boolean {
    return (
      this.userRole === UserRole.ADMIN
    );
  }

  get audienceLine(): string {
    const notification =
      this.notification;

    if (!notification) {
      return '';
    }

    if (
      Array.isArray(notification.to) &&
      notification.to.length > 0
    ) {
      if (
        notification.scope ===
        'INDIVIDUAL'
      ) {
        if (
          notification.to.length === 1
        ) {
          const user =
            notification.to[0] as UserDto;

          return (
            [
              user.firstName,
              user.lastName,
            ]
              .filter(Boolean)
              .join(' ')
              .trim() ||
            user.email ||
            `ID: ${user.id}`
          );
        }

        return (
          notification.to as UserDto[]
        )
          .map((user) => {
            const name =
              [
                user.firstName,
                user.lastName,
              ]
                .filter(Boolean)
                .join(' ')
                .trim() ||
              user.email ||
              `ID: ${user.id}`;

            return user.id ===
              this.currentUserId
              ? `<strong>${name}</strong>`
              : name;
          })
          .join(', ');
      }

      return this.scopeLabel(
        notification.scope,
      );
    }

    if (
      notification.stage?.description
    ) {
      return notification.stage.description;
    }

    if (notification.stage?.number) {
      return String(
        notification.stage.number,
      );
    }

    return this.scopeLabel(
      notification.scope,
    );
  }

  /**
   * Si `to` contiene datos se usa esa lista.
   * Como alternativa se utilizan los IDs de
   * `readBy`.
   */
  get recipients(): UserDto[] {
    const notification =
      this.notification;

    if (!notification) {
      return [];
    }

    if (
      Array.isArray(notification.to) &&
      notification.to.length > 0
    ) {
      return notification.to;
    }

    if (
      Array.isArray(
        notification.readBy,
      ) &&
      notification.readBy.length > 0
    ) {
      return notification.readBy.map(
        (id) =>
          ({
            id,
          }) as UserDto,
      );
    }

    return [];
  }

  get studentRows(): NewStudentRow[] {
    return (
      this.notification?.message?.rows ??
      []
    );
  }

  get hasStudentRows(): boolean {
    return (
      this.studentRows.length > 0
    );
  }

  get isDemoClassNotification(): boolean {
    if (
      this.isPlacementExamNotification
    ) {
      return false;
    }

    const kind =
      this.notification?.message?.kind;

    return (
      kind === 'demo-class' ||
      kind === 'demo_class'
    );
  }

  get isPlacementExamNotification():
    boolean {
    const kind =
      this.notification?.message?.kind;

    if (
      kind === 'placement-exam' ||
      kind === 'placement_exam'
    ) {
      return true;
    }

    const title = (
      this.notification?.title ?? ''
    ).toLowerCase();

    const body = (
      this.notification?.message?.body ??
      ''
    ).toLowerCase();

    return (
      /examen de ubicaci[oó]n|placement\s*exam/.test(
        `${title} ${body}`,
      )
    );
  }

  get isLeadRequestNotification():
    boolean {
    return (
      (this.isDemoClassNotification ||
        this
          .isPlacementExamNotification) &&
      !!this.requestLead
    );
  }

  get requestLead():
    DemoClassLead | null {
    return (
      this.notification?.message?.lead ??
      null
    );
  }

  get placementExamSubtypeLabel():
    string | null {
    if (
      !this
        .isPlacementExamNotification ||
      !this.requestLead
    ) {
      return null;
    }

    const lead = this.requestLead;

    const label =
      lead.placementExamTypeLabel?.trim();

    if (label) {
      return label;
    }

    if (
      lead.placementExamType ===
      'PLACEMENT_TEST'
    ) {
      return 'Placement test';
    }

    if (
      lead.placementExamType ===
      'SPEAKING_TEST'
    ) {
      return 'Test de speaking';
    }

    return null;
  }

  get isPlacementTestRequestNotification():
    boolean {
    const lead = this.requestLead;

    return (
      !!lead &&
      this
        .isPlacementExamNotification &&
      lead.placementExamType ===
        'PLACEMENT_TEST'
    );
  }

  get isSpeakingPlacementRequestNotification():
    boolean {
    const lead = this.requestLead;

    return (
      !!lead &&
      this
        .isPlacementExamNotification &&
      lead.placementExamType !==
        'PLACEMENT_TEST'
    );
  }

  get assignedIsPlacementTest():
    boolean {
    if (
      !this
        .isPlacementSchedulingAssignment
    ) {
      return false;
    }

    return isPlacementTestExam(
      'PLACEMENT_EXAM',
      this
        .leadSchedulingAssignedSummary
        .placementExamType,
    );
  }

  get isLeadSchedulingAssignedNotification():
    boolean {
    return (
      this.notification?.message?.kind ===
      'lead-scheduling-assigned'
    );
  }

  get isLeadSchedulingCancelledNotification():
    boolean {
    return (
      this.notification?.message?.kind ===
      'lead-scheduling-cancelled'
    );
  }

  get isActiveStudentsReportNotification():
    boolean {
    const messageKind =
      this.notification?.message?.kind;

    const metadataKind = (
      this.notification?.metadata as {
        kind?: string;
      } | null
    )?.kind;

    return (
      messageKind ===
        'active_students_report' ||
      metadataKind ===
        'active_students_report'
    );
  }

  get activeStudentsReportJobId():
    string | null {
    const metadata =
      this.notification?.metadata as {
        jobId?: string;
      } | null;

    const summary =
      this.notification?.message
        ?.summary as
        | {
            jobId?: string;
          }
        | undefined;

    return (
      metadata?.jobId ??
      summary?.jobId ??
      null
    );
  }

  get isLeadSchedulingInstructorCard():
    boolean {
    return (
      (this
        .isLeadSchedulingAssignedNotification ||
        this
          .isLeadSchedulingCancelledNotification) &&
      this.userRole ===
        UserRole.INSTRUCTOR
    );
  }

  get leadSchedulingRequestKind():
    LeadSchedulingNotificationRequestKind | null {
    const summary =
      this.leadSchedulingAssignedSummary;

    if (
      summary.requestKind ===
        'PLACEMENT_EXAM' ||
      summary.requestKind ===
        'DEMO_CLASS'
    ) {
      return summary.requestKind;
    }

    const body =
      this.notification?.message?.body ??
      '';

    if (
      /examen de ubicaci[oó]n|placement\s*exam|PLACEMENT_EXAM/i.test(
        body,
      )
    ) {
      return 'PLACEMENT_EXAM';
    }

    if (
      /cortes[ií]a|clase de demo|demo\s*class|DEMO_CLASS/i.test(
        body,
      )
    ) {
      return 'DEMO_CLASS';
    }

    return null;
  }

  get isPlacementSchedulingAssignment():
    boolean {
    return (
      this.leadSchedulingRequestKind ===
      'PLACEMENT_EXAM'
    );
  }

  get isDemoSchedulingAssignment():
    boolean {
    return (
      this.leadSchedulingRequestKind ===
      'DEMO_CLASS'
    );
  }

  private parseLeadSchedulingBody(
    body: string,
  ): {
    leadName: string | null;
    requestId: number | null;
    scheduledDate: string | null;
    scheduledHour: number | null;
    status: string | null;
    requestKind:
      LeadSchedulingNotificationRequestKind | null;
  } {
    const leadMatch =
      body.match(
        /\(([^)]+)\)\s*[\.\n]/,
      );

    const requestMatch =
      body.match(
        /Solicitud\s*#(\d+)/i,
      );

    const dateMatch =
      body.match(
        /Fecha:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i,
      );

    const hourMatch =
      body.match(
        /hora:\s*(\d{1,2})/i,
      );

    const statusMatch =
      body.match(
        /Estado:\s*([A-Za-z_]+)/i,
      );

    const parsedRequestId =
      requestMatch?.[1] != null
        ? Number.parseInt(
            requestMatch[1],
            10,
          )
        : null;

    const parsedHour =
      hourMatch?.[1] != null
        ? Number.parseInt(
            hourMatch[1],
            10,
          )
        : null;

    let requestKind:
      LeadSchedulingNotificationRequestKind | null =
      null;

    if (
      /examen de ubicaci[oó]n|placement\s*exam|PLACEMENT_EXAM/i.test(
        body,
      )
    ) {
      requestKind = 'PLACEMENT_EXAM';
    } else if (
      /cortes[ií]a|clase de demo|demo\s*class|DEMO_CLASS/i.test(
        body,
      )
    ) {
      requestKind = 'DEMO_CLASS';
    }

    return {
      leadName:
        leadMatch?.[1]?.trim() ??
        null,

      requestId:
        parsedRequestId != null &&
        Number.isFinite(
          parsedRequestId,
        )
          ? parsedRequestId
          : null,

      scheduledDate:
        dateMatch?.[1]?.trim() ??
        null,

      scheduledHour:
        parsedHour != null &&
        Number.isFinite(parsedHour)
          ? parsedHour
          : null,

      status:
        statusMatch?.[1]
          ?.trim()
          .toUpperCase() ?? null,

      requestKind,
    };
  }

  get leadSchedulingAssignedSummary():
    LeadSchedulingAssignedSummary {
    const raw =
      this.notification?.message
        ?.summary as
        | LeadSchedulingAssignedSummary
        | undefined;

    const body =
      this.notification?.message?.body ??
      '';

    const parsed =
      this.parseLeadSchedulingBody(
        body,
      );

    return {
      leadSchedulingRequestId:
        typeof raw
          ?.leadSchedulingRequestId ===
          'number' &&
        Number.isFinite(
          raw.leadSchedulingRequestId,
        )
          ? raw.leadSchedulingRequestId
          : parsed.requestId ??
            undefined,

      leadName:
        raw?.leadName ??
        parsed.leadName ??
        undefined,

      scheduledDate:
        raw?.scheduledDate ??
        parsed.scheduledDate ??
        undefined,

      scheduledHour:
        typeof raw?.scheduledHour ===
          'number' &&
        Number.isFinite(
          raw.scheduledHour,
        )
          ? raw.scheduledHour
          : parsed.scheduledHour ??
            undefined,

      status: (
        raw?.status ??
        parsed.status ??
        undefined
      )?.toUpperCase(),

      requestNotes:
        raw?.requestNotes?.trim() ||
        undefined,

      requestKind:
        raw?.requestKind ??
        parsed.requestKind ??
        undefined,

      placementExamType:
        raw?.placementExamType,

      examLink:
        raw?.examLink ?? undefined,
    };
  }

  get leadRequestSchedulingId():
    number | null {
    const leadId =
      this.requestLead
        ?.leadSchedulingRequestId;

    if (
      typeof leadId === 'number' &&
      Number.isFinite(leadId)
    ) {
      return leadId;
    }

    const summaryId = (
      this.notification?.message
        ?.summary as
        | DemoClassSummary
        | undefined
    )?.leadSchedulingRequestId;

    if (
      typeof summaryId ===
        'number' &&
      Number.isFinite(summaryId)
    ) {
      return summaryId;
    }

    return null;
  }

  get showLeadRequestAdminAction():
    boolean {
    return (
      this.userRole ===
        UserRole.ADMIN &&
      this
        .isLeadRequestNotification &&
      this.leadRequestSchedulingId != null
    );
  }

  get leadSchedulingAssignedId():
    number | null {
    const id =
      this
        .leadSchedulingAssignedSummary
        .leadSchedulingRequestId;

    return (
      typeof id === 'number' &&
      Number.isFinite(id)
        ? id
        : null
    );
  }

  leadSchedulingStatusLabel(
    status?: string,
  ): string {
    if (!status) {
      return '—';
    }

    return (
      NotificationDetailV2Component
        .leadSchedulingStatusEs[
        status
      ] ?? status
    );
  }

  formatLeadSchedulingDate(
    iso: string,
  ): string {
    const date = new Date(
      `${iso}T12:00:00`,
    );

    if (
      Number.isNaN(date.getTime())
    ) {
      return iso;
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );
  }

  formatLeadSchedulingHour(
    hour: number,
  ): string {
    const normalizedHour = Math.max(
      0,
      Math.min(
        23,
        Math.floor(hour),
      ),
    );

    return `${String(
      normalizedHour,
    ).padStart(2, '0')}:00`;
  }

  get showNotificationRawBody():
    boolean {
    if (
      !this.notification?.message?.body
    ) {
      return false;
    }

    if (
      this
        .isActiveStudentsReportNotification
    ) {
      return false;
    }

    if (
      this
        .isLeadRequestNotification &&
      this.requestLead
    ) {
      return false;
    }

    if (
      this
        .isLeadSchedulingInstructorCard
    ) {
      return false;
    }

    if (
      this.notification?.message?.kind ===
      'assessment-assigned'
    ) {
      return false;
    }

    if (
      this.notification?.message?.kind ===
      'assessment-results-ready'
    ) {
      return false;
    }

    if (
      this.notification?.message?.kind ===
      'assessment-unassigned'
    ) {
      return false;
    }

    return true;
  }

  get leadSchedulingShowGenericNextStep():
    boolean {
    const status =
      this
        .leadSchedulingAssignedSummary
        .status;

    if (!status) {
      return true;
    }

    return ![
      'PENDING',
      'SCHEDULED',
      'CANCELLED',
      'COMPLETED',
    ].includes(status);
  }

  get showPlacementExamListLink():
    boolean {
    if (
      !this
        .isPlacementExamNotification &&
      !this
        .isPlacementSchedulingAssignment
    ) {
      return false;
    }

    return (
      this.userRole ===
        UserRole.INSTRUCTOR ||
      this.userRole === UserRole.ADMIN
    );
  }

  get formattedBody(): string {
    const body =
      sanitizeNotificationBody(
        this.notification?.message
          ?.body ?? '',
      );

    return body
      .replace(/\.\s+/g, '.<br>')
      .trim();
  }

  isReadBy(
    userId: number,
  ): boolean {
    return !!this.notification?.readBy?.includes(
      userId,
    );
  }

  trackByUid(
    index: number,
    user: UserDto,
  ): number {
    return user.id;
  }

  goBack(): void {
    this.location.back();
  }

  goToActiveStudentsReport(): void {
    const jobId =
      this.activeStudentsReportJobId;

    void this.router.navigate(
      [
        '/dashboard/active-students-report',
      ],
      {
        queryParams: jobId
          ? {
              jobId,
            }
          : {},
      },
    );
  }

  goToPlacementExamList(): void {
    const queryParams = {
      kind: 'PLACEMENT_EXAM' as const,
    };

    if (
      this.userRole ===
      UserRole.INSTRUCTOR
    ) {
      void this.router.navigate(
        [
          '/dashboard/instructor/lead-scheduling-requests',
        ],
        {
          queryParams,
        },
      );

      return;
    }

    if (
      this.userRole === UserRole.ADMIN
    ) {
      void this.router.navigate(
        [
          '/dashboard/admin/lead-scheduling-requests',
        ],
        {
          queryParams,
        },
      );
    }
  }

  goToLeadRequestAdminDetail():
    void {
    const id =
      this.leadRequestSchedulingId;

    if (id == null) {
      return;
    }

    void this.router.navigate([
      '/dashboard/admin/lead-scheduling-requests',
      id,
    ]);
  }

  goToAssignedLeadScheduling():
    void {
    const id =
      this.leadSchedulingAssignedId;

    if (id != null) {
      void this.router.navigate([
        '/dashboard/instructor/lead-scheduling-requests',
        id,
      ]);

      return;
    }

    if (
      this
        .isPlacementSchedulingAssignment
    ) {
      this.goToPlacementExamList();
      return;
    }

    void this.router.navigate([
      '/dashboard/instructor/lead-scheduling-requests',
    ]);
  }

  onDeleteClick(): void {
    if (!this.notification?.id) {
      return;
    }

    this.openConfirmDelete(
      this.notification.id,
    );
  }

  private openConfirmDelete(
    notificationId: number,
  ): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Eliminar notificación',
      message:
        '¿Deseas eliminar esta notificación? Esta acción no se puede deshacer.',
      isInfo: true,
      showButtons: true,

      close: () => {
        this.modal.show = false;
      },

      confirm: () => {
        this.confirmDelete(
          notificationId,
        );
      },
    };
  }

  private confirmDelete(
    notificationId: number,
  ): void {
    this.modal.show = false;
    this.deleting = true;

    this.notificationService
      .deleteNotification(
        notificationId,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deleting = false;

          this.showModalMessage({
            title:
              'Notificación eliminada',
            message:
              'La notificación fue eliminada correctamente.',
            isSuccess: true,
          });

          setTimeout(() => {
            this.location.back();
          }, 500);
        },

        error: () => {
          this.deleting = false;

          this.showModalMessage({
            title:
              'Error al eliminar',
            message:
              'No se pudo eliminar la notificación. Intenta nuevamente.',
            isError: true,
          });
        },
      });
  }

  toggleRecipients(): void {
    this.showAllRecipients =
      !this.showAllRecipients;
  }

  toggleStudentMenu(
    index: number,
  ): void {
    this.openStudentMenuIndex =
      this.openStudentMenuIndex === index
        ? null
        : index;
  }

  openStudentEditModal(
    row: NewStudentRow,
  ): void {
    this.studentToEdit = {
      ...row,
    };

    this.showStudentEditModal = true;

    this.openStudentMenuIndex = null;
  }

  closeStudentEditModal(): void {
    this.showStudentEditModal = false;

    this.studentToEdit = null;
  }

  onRequestCreateStudent(
    student: CreateStudentWithUserDto,
  ): void {
    const fullName = [
      student.firstName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Crear estudiante',
      message:
        `¿Deseas crear al estudiante ${
          fullName || student.email
        }?`,
      isInfo: true,
      isError: false,
      isSuccess: false,
      showButtons: true,

      close: () => {
        this.modal.show = false;

        this.modal =
          modalInitializer();
      },

      confirm: () => {
        this.modal.show = false;

        this.confirmCreateStudent(
          student,
        );
      },
    };
  }

  private confirmCreateStudent(
    student: CreateStudentWithUserDto,
  ): void {
    this.studentsService
      .registerStudentWithUser(
        student,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showStudentEditModal =
            false;

          this.studentToEdit = null;

          this.showModalMessage({
            title:
              'Estudiante creado',
            message:
              'El estudiante fue creado correctamente.',
            isSuccess: true,
          });
        },

        error: (error) => {
          console.error(
            'Error al crear estudiante:',
            error,
          );

          this.showModalMessage({
            title:
              'Error al crear estudiante',
            message:
              error?.error?.message ||
              error?.message ||
              'No se pudo crear el estudiante. Intenta nuevamente.',
            isError: true,
          });
        },
      });
  }

  private showModalMessage({
    title,
    message,
    isSuccess = false,
    isError = false,
  }: {
    title: string;
    message: string;
    isSuccess?: boolean;
    isError?: boolean;
  }): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title,
      message,
      isSuccess,
      isError,

      close: () => {
        this.modal.show = false;

        this.modal =
          modalInitializer();
      },
    };

    setTimeout(() => {
      this.modal.show = false;

      this.modal =
        modalInitializer();
    }, 2000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}