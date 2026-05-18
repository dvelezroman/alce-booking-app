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
import {
  LeadSchedulingRequestKind,
  LeadSchedulingRequestRow,
  LeadSchedulingRequestStatus,
  UpdateLeadSchedulingAdminDto,
} from '../../../../services/dtos/lead-scheduling-request.dto';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message.util';

type StatusAction = 'keep' | 'PENDING' | 'SCHEDULED' | 'CANCELLED';

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
    statusAction: this.fb.nonNullable.control<StatusAction>('keep'),
    adminNotes: ['', [Validators.maxLength(8000)]],
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly leadScheduling: LeadSchedulingRequestService,
    private readonly instructorsService: InstructorsService,
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

  kindText(k: LeadSchedulingRequestKind): string {
    return this.kindLabel[k] ?? k;
  }

  statusText(s: LeadSchedulingRequestStatus): string {
    return this.statusLabel[s] ?? s;
  }

  slotText(row: LeadSchedulingRequestRow): string {
    const d = row.scheduledDate;
    const h = row.scheduledHour;
    if (!d && h == null) return '—';
    const datePart = d ? new Date(d + 'T12:00:00').toLocaleDateString() : '—';
    const hourPart = h != null ? `${h}:00` : '—';
    return `${datePart} · ${hourPart}`;
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
    const body = this.buildPatchBody(raw);
    this.saving = true;
    this.error = null;
    this.leadScheduling.patchAdmin(this.row.id, body).subscribe({
      next: (updated) => {
        this.saving = false;
        this.row = updated;
        this.patchFormFromRow(updated);
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
          },
          confirm: () => {
            this.modal.show = false;
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
        'Se marcará la solicitud como <strong>CANCELLED</strong>. No hay borrado físico en el servidor.',
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
      statusAction: 'keep' as StatusAction,
      adminNotes: row.adminNotes ?? '',
    };
  }

  private patchFormFromRow(row: LeadSchedulingRequestRow): void {
    this.form.reset(this.formValueFromRow(row));
  }

  private buildPatchBody(raw: Record<string, unknown>): UpdateLeadSchedulingAdminDto {
    const body: UpdateLeadSchedulingAdminDto = {};

    const instructorId = raw['instructorId'];
    const scheduledDate = raw['scheduledDate'];
    const scheduledHour = raw['scheduledHour'];
    const statusAction = raw['statusAction'] as StatusAction;
    const adminNotes = raw['adminNotes'];

    if (instructorId === '' || instructorId === null || instructorId === undefined) {
      body.instructorId = null;
    } else {
      body.instructorId = Number(instructorId);
    }

    const dateStr = String(scheduledDate ?? '').trim();
    body.scheduledDate = dateStr === '' ? null : dateStr;

    if (scheduledHour === '' || scheduledHour === null || scheduledHour === undefined) {
      body.scheduledHour = null;
    } else {
      body.scheduledHour = Number(scheduledHour);
    }

    const notes = String(adminNotes ?? '').trim();
    body.adminNotes = notes === '' ? null : notes;

    if (statusAction !== 'keep') {
      body.status = statusAction;
    }

    return body;
  }
}
