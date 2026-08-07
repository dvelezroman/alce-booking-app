import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, EMPTY, forkJoin, switchMap, takeUntil } from 'rxjs';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import { InstructorsService } from '../../../../services/instructors.service';
import { Instructor } from '../../../../services/dtos/instructor.dto';
import { LeadSchedulingRequestService } from '../../../../services/lead-scheduling-request.service';
import { LeadSchedulingPendingCountService } from '../../../../services/lead-scheduling-pending-count.service';
import { UserRole } from '../../../../services/dtos/user.dto';
import {
  LeadSchedulingRequestKind,
  LeadSchedulingRequestRow,
  LeadSchedulingRequestStatus,
  UpdateLeadSchedulingAdminDto,
} from '../../../../services/dtos/lead-scheduling-request.dto';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message.util';
import {
  isPlacementTestExam,
  isSpeakingPlacementExam,
  leadSchedulingKindLabel,
  leadSchedulingScheduleSummary,
} from '../../../../shared/utils/lead-scheduling-request.util';

@Component({
  selector: 'app-admin-lead-scheduling-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './admin-lead-scheduling-detail.component.html',
  styleUrl: './admin-lead-scheduling-detail.component.scss',
})
export class AdminLeadSchedulingDetailComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  row: LeadSchedulingRequestRow | null = null;
  instructors: Instructor[] = [];
  loading = false;
  saving = false;
  error: string | null = null;
  modal: ModalDto = modalInitializer();

  readonly kindLabel: Record<LeadSchedulingRequestKind, string> = {
    DEMO_CLASS: 'Demo / cortesía',
    PLACEMENT_EXAM: 'Examen de ubicación',
  };

  readonly statusLabel: Record<LeadSchedulingRequestStatus, string> = {
    PENDING: 'Pendiente',
    SCHEDULED: 'Agendada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };

  readonly hourOptions = Array.from({ length: 24 }, (_, i) => i);

  form = this.fb.group({
    instructorId: ['' as string | number],
    scheduledDate: [''],
    scheduledHour: ['' as string | number],
    examLink: ['', [Validators.maxLength(2048)]],
    adminNotes: ['', [Validators.maxLength(8000)]],
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly leadScheduling: LeadSchedulingRequestService,
    private readonly instructorsService: InstructorsService,
    private readonly leadSchedulingPending: LeadSchedulingPendingCountService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = Number(params.get('id'));
          if (!Number.isFinite(id) || id < 1) {
            this.loading = false;
            this.error = 'ID inválido.';
            return EMPTY;
          }
          this.loading = true;
          this.error = null;
          this.row = null;
          return forkJoin({
            row: this.leadScheduling.getAdmin(id),
            instructors: this.instructorsService.getAll('ACTIVE'),
          });
        }),
      )
      .subscribe({
        next: ({ row, instructors }) => {
          this.instructors = instructors ?? [];
          this.row = row;
          this.patchFormFromRow(row);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.error = getHttpErrorMessage(
            err,
            'No se pudo cargar la solicitud.',
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isCompleted(): boolean {
    return this.row?.status === 'COMPLETED';
  }

  get isCancelled(): boolean {
    return this.row?.status === 'CANCELLED';
  }

  get isPlacementTest(): boolean {
    return (
      this.row != null &&
      isPlacementTestExam(this.row.kind, this.row.placementExamType)
    );
  }

  get isSpeakingPlacement(): boolean {
    return (
      this.row != null &&
      isSpeakingPlacementExam(this.row.kind, this.row.placementExamType)
    );
  }

  get isDemoClass(): boolean {
    return this.row?.kind === 'DEMO_CLASS';
  }

  get requiresScheduleTriple(): boolean {
    return this.isDemoClass || this.isSpeakingPlacement;
  }

  get typeDetailLabel(): string {
    return this.row ? leadSchedulingKindLabel(this.row) : '';
  }

  get schedulingHint(): string {
    if (this.isPlacementTest) {
      return 'Para agendar: asigna instructor y enlace del examen (URL). El estudiante recibirá el enlace por correo al quedar en estado Agendada.';
    }
    if (this.isSpeakingPlacement) {
      return 'Para agendar: asigna instructor. La fecha y hora suelen venir del asesor; complétalas si faltan. Se notifica al asesor, al estudiante y al instructor.';
    }
    return 'Para agendar: instructor, fecha y hora. Se notifica al asesor y al instructor.';
  }

  kindText(k: LeadSchedulingRequestKind): string {
    return this.row && k === this.row.kind
      ? leadSchedulingKindLabel(this.row)
      : (this.kindLabel[k] ?? k);
  }

  statusText(s: LeadSchedulingRequestStatus): string {
    return this.statusLabel[s] ?? s;
  }

  slotText(row: LeadSchedulingRequestRow): string {
    return leadSchedulingScheduleSummary(row);
  }

  instructorLabelFromRow(row: LeadSchedulingRequestRow): string {
    const u = row.instructor?.user;
    if (!u) return '—';
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return name || u.email || `ID ${row.instructorId}`;
  }

  instructorOptionLabel(ins: Instructor): string {
    const u = ins.user;
    if (!u) return `Instructor #${ins.id}`;
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return name || u.email || `Instructor #${ins.id}`;
  }

  goList(): void {
    void this.router.navigate(['/dashboard/admin/lead-scheduling-requests']);
  }

  /** Compara valores de selects que mezclan '' con id/hora numéricos. */
  readonly compareIdOrEmpty = (
    a: string | number | null | undefined,
    b: string | number | null | undefined,
  ): boolean => {
    const empty = (v: string | number | null | undefined) =>
      v === '' || v === null || v === undefined;
    if (empty(a) && empty(b)) return true;
    if (empty(a) || empty(b)) return false;
    return Number(a) === Number(b);
  };

  /** Abandona la edición y vuelve al listado sin guardar. */
  discardEdits(): void {
    if (this.saving) return;
    this.goList();
  }

  save(): void {
    if (!this.row || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const examLinkErr = this.validateExamLinkForSave(raw);
    if (examLinkErr) {
      this.error = examLinkErr;
      return;
    }
    const body = this.buildPatchBody(raw);
    this.saving = true;
    this.error = null;
    this.leadScheduling.patchAdmin(this.row.id, body).subscribe({
      next: (updated) => {
        this.saving = false;
        this.row = updated;
        this.patchFormFromRow(updated);
        this.leadSchedulingPending.refresh(UserRole.ADMIN).subscribe();
        this.modal = {
          ...modalInitializer(),
          show: true,
          title: 'Guardado',
          message:
            '<p><strong>Guardado</strong></p><p>Los cambios se aplicaron correctamente.</p>',
          isSuccess: true,
          isError: false,
          showButtons: true,
          close: () => {
            this.modal.show = false;
            this.goList();
          },
          confirm: () => {
            this.modal.show = false;
            this.goList();
          },
        };
      },
      error: (err) => {
        this.saving = false;
        this.error = getHttpErrorMessage(err, 'No se pudo guardar.');
      },
    });
  }

  confirmCancel(): void {
    if (!this.row || this.row.status === 'CANCELLED') return;
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Cancelar solicitud',
      message:
        'Se marcará la solicitud como <strong>cancelada</strong>. No se elimina del sistema; solo cambia el estado.',
      isError: false,
      isSuccess: false,
      isInfo: true,
      showButtons: true,
      close: () => {
        this.modal.show = false;
      },
      confirm: () => {
        this.modal.show = false;
        this.patchStatusOnly('CANCELLED');
      },
    };
  }

  private patchStatusOnly(status: LeadSchedulingRequestStatus): void {
    if (!this.row) return;
    this.saving = true;
    this.error = null;
    this.leadScheduling.patchAdmin(this.row.id, { status }).subscribe({
      next: (updated) => {
        this.saving = false;
        this.row = updated;
        this.patchFormFromRow(updated);
        this.leadSchedulingPending.refresh(UserRole.ADMIN).subscribe();
      },
      error: (err) => {
        this.saving = false;
        this.error = getHttpErrorMessage(err, 'No se pudo cancelar.');
      },
    });
  }

  private formValueFromRow(row: LeadSchedulingRequestRow) {
    const dateOnly =
      row.scheduledDate && row.scheduledDate.length >= 10
        ? row.scheduledDate.slice(0, 10)
        : row.scheduledDate ?? '';
    return {
      instructorId: row.instructorId != null ? Number(row.instructorId) : ('' as const),
      scheduledDate: dateOnly,
      scheduledHour:
        row.scheduledHour != null && row.scheduledHour !== undefined
          ? Number(row.scheduledHour)
          : ('' as const),
      examLink: row.examLink ?? '',
      adminNotes: row.adminNotes ?? '',
    };
  }

  private patchFormFromRow(row: LeadSchedulingRequestRow): void {
    this.form.reset(this.formValueFromRow(row));
  }

  private validateExamLinkForSave(raw: Record<string, unknown>): string | null {
    if (!this.isPlacementTest) return null;
    const link = String(raw['examLink'] ?? '').trim();
    if (!link) return null;
    try {
      const u = new URL(link);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return 'El enlace del examen debe comenzar con http:// o https://';
      }
    } catch {
      return 'El enlace del examen no es una URL válida.';
    }
    return null;
  }

  private buildPatchBody(raw: Record<string, unknown>): UpdateLeadSchedulingAdminDto {
    const body: UpdateLeadSchedulingAdminDto = {};

    const instructorId = raw['instructorId'];
    const scheduledDate = raw['scheduledDate'];
    const scheduledHour = raw['scheduledHour'];
    const examLink = raw['examLink'];
    const adminNotes = raw['adminNotes'];

    if (instructorId === '' || instructorId === null || instructorId === undefined) {
      body.instructorId = null;
    } else {
      body.instructorId = Number(instructorId);
    }

    if (this.requiresScheduleTriple) {
      const dateStr = String(scheduledDate ?? '').trim();
      body.scheduledDate = dateStr === '' ? null : dateStr;

      if (scheduledHour === '' || scheduledHour === null || scheduledHour === undefined) {
        body.scheduledHour = null;
      } else {
        body.scheduledHour = Number(scheduledHour);
      }
    }

    if (this.isPlacementTest) {
      const link = String(examLink ?? '').trim();
      body.examLink = link === '' ? null : link;
    }

    const notes = String(adminNotes ?? '').trim();
    body.adminNotes = notes === '' ? null : notes;

    return body;
  }
}
