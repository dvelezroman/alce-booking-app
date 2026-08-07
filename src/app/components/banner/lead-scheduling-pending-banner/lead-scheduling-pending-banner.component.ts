import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserRole } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-lead-scheduling-pending-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lead-scheduling-pending-banner.component.html',
  styleUrls: ['./lead-scheduling-pending-banner.component.scss'],
})
export class LeadSchedulingPendingBannerComponent implements OnChanges {
  @Input() count = 0;
  @Input() role: UserRole | null = null;
  /** Incrementar en cada ingreso de sesión para volver a mostrar el toast. */
  @Input() toastToken = 0;
  @Input() showDurationMs = 12_000;

  visible = false;
  private hideTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['toastToken'] && this.toastToken > 0 && this.count > 0) {
      this.showToast();
      return;
    }
    if (changes['count'] && !changes['toastToken']) {
      this.syncVisibilityFromCount();
    }
  }

  get message(): string {
    if (this.count <= 0) return '';

    const n = this.count;
    const plural = n === 1 ? '' : 'es';

    if (this.role === UserRole.ADMIN) {
      return `Hay ${n} solicitud${plural} de examen de ubicación o clases de cortesía sin tutor asignado. Revisa y asigna instructor, fecha y hora.`;
    }

    if (this.role === UserRole.INSTRUCTOR) {
      return `Tienes ${n} solicitud${plural} asignada${plural} (clases de cortesía o exámenes de ubicación) pendiente${plural} de registrar asistencia e informe.`;
    }

    return '';
  }

  private showToast(): void {
    if (this.count <= 0) {
      this.visible = false;
      return;
    }
    this.visible = true;
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => (this.visible = false), this.showDurationMs);
  }

  private syncVisibilityFromCount(): void {
    if (this.count > 0) {
      this.showToast();
    } else {
      this.visible = false;
      clearTimeout(this.hideTimer);
    }
  }

  close(): void {
    this.visible = false;
    clearTimeout(this.hideTimer);
  }

  goToRequests(): void {
    this.visible = false;
    clearTimeout(this.hideTimer);

    if (this.role === UserRole.ADMIN) {
      void this.router.navigate(['/dashboard/admin/lead-scheduling-requests']);
      return;
    }

    if (this.role === UserRole.INSTRUCTOR) {
      void this.router.navigate(['/dashboard/instructor/lead-scheduling-requests']);
    }
  }
}
