import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, EMPTY, switchMap, takeUntil } from 'rxjs';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import { LeadSchedulingRequestService } from '../../../../services/lead-scheduling-request.service';
import {
  LeadSchedulingRequestKind,
  LeadSchedulingRequestRow,
  LeadSchedulingRequestStatus,
} from '../../../../services/dtos/lead-scheduling-request.dto';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message.util';

@Component({
  selector: 'app-instructor-lead-scheduling-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './instructor-lead-scheduling-detail.component.html',
  styleUrl: './instructor-lead-scheduling-detail.component.scss',
})
export class InstructorLeadSchedulingDetailComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  row: LeadSchedulingRequestRow | null = null;
  loading = false;
  error: string | null = null;
  submitting = false;

  modal: ModalDto = modalInitializer();

  readonly kindLabel: Record<LeadSchedulingRequestKind, string> = {
    DEMO_CLASS: 'Cortesía / demo',
    PLACEMENT_EXAM: 'Examen de ubicación',
  };

  readonly statusLabel: Record<LeadSchedulingRequestStatus, string> = {
    PENDING: 'Pendiente de agendar',
    SCHEDULED: 'Agendada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };

  form = this.fb.group({
    attendancePresent: [true],
    instructorReportNotes: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(8000),
      ],
    ],
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly leadScheduling: LeadSchedulingRequestService,
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
          return this.leadScheduling.getMine(id);
        }),
      )
      .subscribe({
        next: (data) => {
          this.row = data;
          this.loading = false;
          this.prefillFormFromRow(data);
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

  get canSubmitReport(): boolean {
    return this.row?.status === 'SCHEDULED';
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
    if (!d && h == null) return 'Sin fecha u hora definidas aún';
    const datePart = d ? this.formatScheduledDate(d) : '—';
    const hourPart = h != null ? `${this.formatScheduledHour(h)} h (24 h)` : '—';
    return `${datePart} · ${hourPart}`;
  }

  private formatScheduledDate(iso: string): string {
    const normalized =
      iso.includes('T') || iso.endsWith('Z') ? iso : `${iso}T12:00:00`;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return iso;
    return parsed.toLocaleDateString('es', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatScheduledHour(h: number): string {
    const hh = Math.max(0, Math.min(23, Math.floor(h)));
    return `${String(hh).padStart(2, '0')}:00`;
  }

  goList(): void {
    void this.router.navigate([
      '/dashboard/instructor/lead-scheduling-requests',
    ]);
  }

  submit(): void {
    if (!this.row || !this.canSubmitReport) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.submitting = true;
    this.leadScheduling
      .submitInstructorReport(this.row.id, {
        attendancePresent: !!raw.attendancePresent,
        instructorReportNotes: String(raw.instructorReportNotes).trim(),
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.modal = {
            ...modalInitializer(),
            show: true,
            title: 'Informe enviado',
            message: 'La solicitud quedó marcada como completada.',
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
          this.submitting = false;
          const msg = getHttpErrorMessage(
            err,
            'No se pudo enviar el informe.',
          );
          this.modal = {
            ...modalInitializer(),
            show: true,
            title: 'Error',
            message: msg,
            isError: true,
            isSuccess: false,
            showButtons: true,
            close: () => {
              this.modal.show = false;
            },
            confirm: () => {
              this.modal.show = false;
            },
          };
        },
      });
  }

  private prefillFormFromRow(_data: LeadSchedulingRequestRow): void {
    this.form.enable();
    this.form.reset({
      attendancePresent: true,
      instructorReportNotes: '',
    });
  }
}
