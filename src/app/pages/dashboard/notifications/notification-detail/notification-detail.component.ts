import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import {
  Notification,
  NewStudentRow,
  CreateStudentWithUserDto,
  LeadSchedulingAssignedSummary,
  LeadSchedulingNotificationRequestKind,
  DemoClassLead,
} from '../../../../services/dtos/notification.dto';
import { UserDto, UserRole } from '../../../../services/dtos/user.dto';
import { selectUserData } from '../../../../store/user.selector';
import { UsersService } from '../../../../services/users.service';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import { NotificationService } from '../../../../services/notification.service';
import { SafeNoteHtmlPipe } from "../../../../pipes/safe-note-html.pipe";

import { StudentEditModalComponent } from '../../../../components/notifications/student-edit-modal/student-edit-modal.component';
import { Stage,  } from '../../../../services/dtos/student.dto';
import { StagesService } from '../../../../services/stages.service';
import { StudentsService } from '../../../../services/students.service';

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, SafeNoteHtmlPipe, StudentEditModalComponent,],
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
})
export class NotificationDetailComponent implements OnInit, OnDestroy {
  notification?: Notification;
  toDisplayName = '';

  userRole: UserRole | null = null;
  protected readonly UserRole = UserRole;

  stages: Stage[] = [];

  private destroy$ = new Subject<void>();

  studentToEdit: NewStudentRow | null = null;
  showStudentEditModal = false;
  openStudentMenuIndex: number | null = null;
  studentMenuPosition = { top: 0, left: 0 };

  modal: ModalDto = modalInitializer();
  deleting = false;

  showAllRecipients = false;
  currentUserId?: number;

  showRecipients = false;
  private origin: 'inbox' | 'sent' | 'status' | 'unknown' = 'unknown';

  private readonly statusEs: Record<Notification['status'], string> = {
    PENDING: 'Pendiente',
    SENT: 'Enviada',
    DELIVERED: 'Entregada',
    READ: 'Leída',
    FAILED: 'Fallida',
  };

  private readonly typeEs: Record<Notification['notificationType'], string> = {
    Announce: 'Anuncio',
    Advice: 'Aviso',
    Commentary: 'Comentario',
    Mandatory: 'Obligatoria',
    System: 'Sistema',
    Meeting: 'Reunión',
    Assessment: 'Evaluación',
  };

  private priorityEs(n?: number): string {
    if (n === 0) return 'Baja';
    if (n === 1) return 'Media';
    if (n === 2) return 'Alta';
    if (n === 3) return 'Urgente';
    return '—';
  }

  estadoLabel = '—';
  tipoLabel = '—';
  prioridadLabel = '—';

  constructor(
    private store: Store,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private stagesService: StagesService,
    private studentsService: StudentsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.stagesService.getAll().subscribe((stages) => {
      this.stages = this.filterAndSortStages(stages);
    });

    const st = history.state as { notification?: Notification; origin?: 'inbox' | 'sent' | 'status' };
    if (st?.notification) {
      this.notification = st.notification;
      this.origin = st.origin ?? 'unknown';

      this.estadoLabel = this.statusEs[this.notification.status];
      this.tipoLabel = this.typeEs[this.notification.notificationType];
      this.prioridadLabel = this.priorityEs(this.notification.priority);

      // Base rule: never show recipients when coming from inbox
      this.showRecipients = this.notification.scope === 'INDIVIDUAL' && this.origin !== 'inbox';
    } else {
      this.router.navigate(['/dashboard/notifications-inbox']);
      return;
    }

    this.store
      .select(selectUserData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: UserDto | null) => {
        if (user) {
          this.applyUser(user);
        } else {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (token) {
            this.usersService.refreshLogin().subscribe({
              next: (u) => this.applyUser(u),
              error: () => { /* noop */ }
            });
          }
        }
      });
  }

  private filterAndSortStages(stages: Stage[]): Stage[] {
    return stages
      .filter(stage => {
        const desc = stage.description.toUpperCase();
        return !desc.startsWith('K-STG') && desc !== 'STAGE 1.0';
      })
      .sort((a, b) => {
        const getNumber = (desc: string) => {
          const match = desc.match(/\d+(\.\d+)?/);
          return match ? parseFloat(match[0]) : 0;
        };

        return getNumber(a.description) - getNumber(b.description);
      });
  }

  private scopeLabel(scope?: string): string {
    switch (scope) {
      case 'ALL_USERS': return 'Todos los usuarios';
      case 'ALL_STUDENTS': return 'Todos los estudiantes';
      case 'ALL_INSTRUCTORS': return 'Todos los instructores';
      case 'INDIVIDUAL': return 'Individual';
      case 'STAGE_STUDENTS': return 'Estudiantes por etapa';
      default: return scope || '';
    }
  }

  get audienceLine(): string {
    const n = this.notification;
    if (!n) return '';

    // Caso: hay destinatarios explícitos
    if (Array.isArray(n.to) && n.to.length > 0) {

      // === INDIVIDUAL ===
      if (n.scope === 'INDIVIDUAL') {

        // Un solo destinatario
        if (n.to.length === 1) {
          const u = n.to[0] as UserDto;
          return (
            [u.firstName, u.lastName].filter(Boolean).join(' ').trim() ||
            u.email ||
            `ID: ${u.id}`
          );
        }

        // Varios destinatarios → resaltar usuario actual
        return (n.to as UserDto[])
          .map(u => {
            const name =
              [u.firstName, u.lastName].filter(Boolean).join(' ').trim() ||
              u.email ||
              `ID: ${u.id}`;

            return u.id === this.currentUserId
              ? `<strong>${name}</strong>`
              : name;
          })
          .join(', ');
      }

      // === GRUPAL ===
      return this.scopeLabel(n.scope);
    }

    // Fallbacks
    if (n.stage?.description) return n.stage.description;
    if (n.stage?.number) return String(n.stage.number);

    return this.scopeLabel(n.scope);
  }

  private applyUser(user: UserDto) {
    this.currentUserId = user.id;
    this.userRole = user.role ?? null;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    this.toDisplayName = fullName || user.email || '';

    // Complete rule: only admins can see recipients (and not from inbox)
    this.showRecipients = this.showRecipients && this.userRole === UserRole.ADMIN;

    this.cdr.markForCheck();
  }

  get isAdmin(): boolean {
    return this.userRole === UserRole.ADMIN;
  }

  /** Lista de IDs a renderizar: si `to` tiene datos, usamos `to`; si no, `readBy`; si no, vacío. */
  get recipients(): UserDto[] {
    const n = this.notification;
    if (!n) return [];
    if (Array.isArray(n.to) && n.to.length > 0) {
      return n.to;
    }

    if (Array.isArray(n.readBy) && n.readBy.length > 0) {
      return n.readBy.map(id => ({ id } as UserDto));
    }

    return [];
  }

  /** Lista de nuevos estudiantes para agregar. */
  get studentRows() {
    return this.notification?.message?.rows ?? [];
  }

  get hasStudentRows(): boolean {
    return this.studentRows.length > 0;
  }

  get isDemoClassNotification(): boolean {
    if (this.isPlacementExamNotification) return false;
    const kind = this.notification?.message?.kind;
    return kind === 'demo-class' || kind === 'demo_class';
  }

  get isPlacementExamNotification(): boolean {
    const kind = this.notification?.message?.kind;
    if (kind === 'placement-exam' || kind === 'placement_exam') return true;
    const title = (this.notification?.title ?? '').toLowerCase();
    const body = (this.notification?.message?.body ?? '').toLowerCase();
    return /examen de ubicaci[oó]n|placement\s*exam/.test(`${title} ${body}`);
  }

  /** Solicitud nueva con datos estructurados del lead (cortesía o ubicación). */
  get isLeadRequestNotification(): boolean {
    return (
      (this.isDemoClassNotification || this.isPlacementExamNotification) && !!this.requestLead
    );
  }

  get requestLead(): DemoClassLead | null {
    return this.notification?.message?.lead ?? null;
  }

  get isLeadSchedulingAssignedNotification(): boolean {
    return this.notification?.message?.kind === 'lead-scheduling-assigned';
  }

  get isLeadSchedulingCancelledNotification(): boolean {
    return this.notification?.message?.kind === 'lead-scheduling-cancelled';
  }

  get isActiveStudentsReportNotification(): boolean {
    const kind = this.notification?.message?.kind;
    const metaKind = (this.notification?.metadata as { kind?: string } | null)?.kind;
    return kind === 'active_students_report' || metaKind === 'active_students_report';
  }

  get activeStudentsReportJobId(): string | null {
    const meta = this.notification?.metadata as { jobId?: string } | null;
    const summary = this.notification?.message?.summary as { jobId?: string } | undefined;
    return meta?.jobId ?? summary?.jobId ?? null;
  }

  /** Tarjeta estructurada para instructores (asignación o cancelación). */
  get isLeadSchedulingInstructorCard(): boolean {
    return (
      (this.isLeadSchedulingAssignedNotification ||
        this.isLeadSchedulingCancelledNotification) &&
      this.userRole === UserRole.INSTRUCTOR
    );
  }

  get leadSchedulingRequestKind(): LeadSchedulingNotificationRequestKind | null {
    const raw = this.leadSchedulingAssignedSummary;
    if (raw.requestKind === 'PLACEMENT_EXAM' || raw.requestKind === 'DEMO_CLASS') {
      return raw.requestKind;
    }
    const body = this.notification?.message?.body ?? '';
    if (/examen de ubicaci[oó]n|placement\s*exam|PLACEMENT_EXAM/i.test(body)) {
      return 'PLACEMENT_EXAM';
    }
    if (/cortes[ií]a|clase de demo|demo\s*class|DEMO_CLASS/i.test(body)) {
      return 'DEMO_CLASS';
    }
    return null;
  }

  get isPlacementSchedulingAssignment(): boolean {
    return this.leadSchedulingRequestKind === 'PLACEMENT_EXAM';
  }

  get isDemoSchedulingAssignment(): boolean {
    return this.leadSchedulingRequestKind === 'DEMO_CLASS';
  }

  private static readonly leadSchedulingStatusEs: Record<string, string> = {
    PENDING: 'Pendiente de agendar',
    SCHEDULED: 'Agendada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };

  private parseLeadSchedulingBody(body: string): {
    leadName: string | null;
    requestId: number | null;
    scheduledDate: string | null;
    scheduledHour: number | null;
    status: string | null;
    requestKind: LeadSchedulingNotificationRequestKind | null;
  } {
    const leadMatch = body.match(/\(([^)]+)\)\s*[\.\n]/);
    const solicitudMatch = body.match(/Solicitud\s*#(\d+)/i);
    const fechaMatch = body.match(/Fecha:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    const horaMatch = body.match(/hora:\s*(\d{1,2})/i);
    const estadoMatch = body.match(/Estado:\s*([A-Za-z_]+)/i);

    const reqParsed = solicitudMatch?.[1] != null ? parseInt(solicitudMatch[1], 10) : null;
    const hourParsed = horaMatch?.[1] != null ? parseInt(horaMatch[1], 10) : null;

    let requestKind: LeadSchedulingNotificationRequestKind | null = null;
    if (/examen de ubicaci[oó]n|placement\s*exam|PLACEMENT_EXAM/i.test(body)) {
      requestKind = 'PLACEMENT_EXAM';
    } else if (/cortes[ií]a|clase de demo|demo\s*class|DEMO_CLASS/i.test(body)) {
      requestKind = 'DEMO_CLASS';
    }

    return {
      leadName: leadMatch?.[1]?.trim() ?? null,
      requestId: reqParsed != null && Number.isFinite(reqParsed) ? reqParsed : null,
      scheduledDate: fechaMatch?.[1]?.trim() ?? null,
      scheduledHour: hourParsed != null && Number.isFinite(hourParsed) ? hourParsed : null,
      status: estadoMatch?.[1]?.trim().toUpperCase() ?? null,
      requestKind,
    };
  }

  get leadSchedulingAssignedSummary(): LeadSchedulingAssignedSummary {
    const raw = this.notification?.message?.summary as LeadSchedulingAssignedSummary | undefined;
    const body = this.notification?.message?.body ?? '';
    const parsed = this.parseLeadSchedulingBody(body);
    return {
      leadSchedulingRequestId:
        typeof raw?.leadSchedulingRequestId === 'number' && Number.isFinite(raw.leadSchedulingRequestId)
          ? raw.leadSchedulingRequestId
          : parsed.requestId ?? undefined,
      leadName: raw?.leadName ?? parsed.leadName ?? undefined,
      scheduledDate: raw?.scheduledDate ?? parsed.scheduledDate ?? undefined,
      scheduledHour:
        typeof raw?.scheduledHour === 'number' && Number.isFinite(raw.scheduledHour)
          ? raw.scheduledHour
          : parsed.scheduledHour ?? undefined,
      status: (raw?.status ?? parsed.status ?? undefined)?.toUpperCase(),
      requestKind: raw?.requestKind ?? parsed.requestKind ?? undefined,
    };
  }

  get leadSchedulingAssignedId(): number | null {
    const id = this.leadSchedulingAssignedSummary.leadSchedulingRequestId;
    return typeof id === 'number' && Number.isFinite(id) ? id : null;
  }

  leadSchedulingStatusLabel(status?: string): string {
    if (!status) return '—';
    return NotificationDetailComponent.leadSchedulingStatusEs[status] ?? status;
  }

  formatLeadSchedulingDate(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatLeadSchedulingHour(h: number): string {
    const hh = Math.max(0, Math.min(23, Math.floor(h)));
    return `${String(hh).padStart(2, '0')}:00`;
  }

  /** Oculta el cuerpo técnico cuando la tarjeta estructurada ya muestra la información. */
  get showNotificationRawBody(): boolean {
    if (!this.notification?.message?.body) return false;
    if (this.isLeadRequestNotification && this.requestLead) return false;
    if (this.isLeadSchedulingInstructorCard) {
      return false;
    }
    return true;
  }

  get leadSchedulingShowGenericNextStep(): boolean {
    const s = this.leadSchedulingAssignedSummary.status;
    if (!s) return true;
    return !['PENDING', 'SCHEDULED', 'CANCELLED', 'COMPLETED'].includes(s);
  }

  get showPlacementExamListLink(): boolean {
    if (!this.isPlacementExamNotification && !this.isPlacementSchedulingAssignment) {
      return false;
    }
    return this.userRole === UserRole.INSTRUCTOR || this.userRole === UserRole.ADMIN;
  }

  goToActiveStudentsReport(): void {
    const jobId = this.activeStudentsReportJobId;
    void this.router.navigate(['/dashboard/active-students-report'], {
      queryParams: jobId ? { jobId } : {},
    });
  }

  goToPlacementExamList(): void {
    const queryParams = { kind: 'PLACEMENT_EXAM' as const };
    if (this.userRole === UserRole.INSTRUCTOR) {
      void this.router.navigate(['/dashboard/instructor/lead-scheduling-requests'], {
        queryParams,
      });
      return;
    }
    if (this.userRole === UserRole.ADMIN) {
      void this.router.navigate(['/dashboard/admin/lead-scheduling-requests'], {
        queryParams,
      });
    }
  }

  goToAssignedLeadScheduling(): void {
    const id = this.leadSchedulingAssignedId;
    if (id != null) {
      void this.router.navigate([
        '/dashboard/instructor/lead-scheduling-requests',
        id,
      ]);
    } else if (this.isPlacementSchedulingAssignment) {
      this.goToPlacementExamList();
    } else {
      void this.router.navigate(['/dashboard/instructor/lead-scheduling-requests']);
    }
  }

  get formattedBody(): string {
    const body = this.notification?.message?.body ?? '';

    return body
      .replace(/\.\s+/g, '.<br>')
      .trim();
  }

  /** True si el uid está en readBy (lo leyó). */
  isReadBy(uid: number): boolean {
    return !!this.notification?.readBy?.includes(uid);
  }

  trackByUid(index: number, user: UserDto): number {
    return user.id;
  }

  goBack(): void {
    this.location.back();
  }

  onDeleteClick(): void {
    if (!this.notification?.id) return;
    this.openConfirmDelete(this.notification.id);
  }

  private openConfirmDelete(notificationId: number): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Eliminar notificación',
      message: '¿Deseas eliminar esta notificación? Esta acción no se puede deshacer.',
      isInfo: true,
      showButtons: true,
      close: () => { this.modal.show = false; },
      confirm: () => this.confirmDelete(notificationId),
    };
  }

  private confirmDelete(notificationId: number): void {
    this.modal.show = false;
    this.deleting = true;

    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.deleting = false;
        this.showModalMessage({
          title: 'Notificación eliminada',
          message: 'La notificación fue eliminada correctamente.',
          isSuccess: true,
        });
        setTimeout(() => this.location.back(), 500);
      },
      error: () => {
        this.deleting = false;
        this.showModalMessage({
          title: 'Error al eliminar',
          message: 'No se pudo eliminar la notificación. Intenta nuevamente.',
          isError: true,
        });
      },
    });
  }

  toggleRecipients(): void { this.showAllRecipients = !this.showAllRecipients }
    toggleStudentMenu(index: number): void {
    this.openStudentMenuIndex =
    this.openStudentMenuIndex === index ? null : index;
  }

  openStudentEditModal(row: NewStudentRow): void {
    this.studentToEdit = { ...row };
    this.showStudentEditModal = true;
    this.openStudentMenuIndex = null;
  }

  closeStudentEditModal(): void {
    this.showStudentEditModal = false;
    this.studentToEdit = null;
  }

  onRequestCreateStudent(student: CreateStudentWithUserDto): void {
    //console.log('Datos recibidos desde el modal para crear:', student);

    const fullName = [student.firstName, student.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Crear estudiante',
      message: `¿Deseas crear al estudiante ${fullName || student.email}?`,
      isInfo: true,
      isError: false,
      isSuccess: false,
      showButtons: true,
      close: () => {
        this.modal.show = false;
        this.modal = modalInitializer();
      },
      confirm: () => {
        this.modal.show = false;
        this.confirmCreateStudent(student);
      },
    };
  }

  private confirmCreateStudent(student: CreateStudentWithUserDto): void {

    this.studentsService.registerStudentWithUser(student).subscribe({
      next: (createdStudent) => {
        //console.log('Estudiante creado correctamente:', createdStudent);

        this.showStudentEditModal = false;
        this.studentToEdit = null;

        this.showModalMessage({
          title: 'Estudiante creado',
          message: 'El estudiante fue creado correctamente.',
          isSuccess: true,
        });
      },
      error: (error) => {
        console.error('Error al crear estudiante:', error);

        this.showModalMessage({
          title: 'Error al crear estudiante',
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
  }) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title,
      message,
      isSuccess,
      isError,
      close: () => {
        this.modal.show = false;
        this.modal = modalInitializer();
      },
    };

    setTimeout(() => {
      this.modal.show = false;
      this.modal = modalInitializer();
    }, 2000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
