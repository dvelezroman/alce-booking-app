import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../../services/assessment.service';
import {
  AutomaticPromotionRow,
  AutomaticPromotionSource,
} from '../../../services/dtos/assessment.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-stage-promotion-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './stage-promotion-config.component.html',
  styleUrl: './stage-promotion-config.component.scss',
})
export class StagePromotionConfigComponent implements OnInit {
  cronEnabled = true;
  cronLoading = false;
  runLoading = false;
  reportLoading = false;

  from = '';
  to = '';
  search = '';
  page = 1;
  limit = 25;
  total = 0;
  totalPages = 0;
  rows: AutomaticPromotionRow[] = [];

  modal: ModalDto = modalInitializer();

  constructor(private readonly assessmentService: AssessmentService) {}

  ngOnInit(): void {
    this.loadCron();
    this.loadReport();
  }

  loadCron(): void {
    this.cronLoading = true;
    this.assessmentService.getPromotionCron().subscribe({
      next: (status) => {
        this.cronEnabled = status.enabled;
        this.cronLoading = false;
      },
      error: () => {
        this.cronLoading = false;
        this.showModal('Error al cargar el estado del cron', true);
      },
    });
  }

  onCronToggle(enabled: boolean): void {
    this.cronLoading = true;
    this.assessmentService.setPromotionCron(enabled).subscribe({
      next: (status) => {
        this.cronEnabled = status.enabled;
        this.cronLoading = false;
        this.showModal(
          status.enabled
            ? 'Cron de promoción automática activado'
            : 'Cron de promoción automática desactivado',
          false,
          true,
        );
      },
      error: () => {
        this.cronLoading = false;
        this.showModal('Error al actualizar el cron', true);
      },
    });
  }

  confirmRunNow(): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      isInfo: true,
      showButtons: true,
      title: 'Ejecutar promoción',
      message:
        'Se revisarán alumnos con Grammar y Speaking aprobados en el stage actual y se promoverán si corresponde. ¿Continuar?',
      close: () => this.closeModal(),
      confirm: () => {
        this.closeModal();
        this.runNow();
      },
    };
  }

  runNow(): void {
    this.runLoading = true;
    this.assessmentService.promoteEligible().subscribe({
      next: (result) => {
        this.runLoading = false;
        this.showModal(
          `Revisados: ${result.scanned}. Promovidos: ${result.promoted}.`,
          false,
          true,
        );
        this.loadReport();
      },
      error: () => {
        this.runLoading = false;
        this.showModal('Error al ejecutar la promoción', true);
      },
    });
  }

  loadReport(): void {
    this.reportLoading = true;
    this.assessmentService
      .listAutomaticPromotions({
        from: this.from || undefined,
        to: this.to || undefined,
        search: this.search.trim() || undefined,
        page: this.page,
        limit: this.limit,
      })
      .subscribe({
        next: (report) => {
          this.rows = report.data;
          this.total = report.meta.total;
          this.totalPages = report.meta.totalPages;
          this.page = report.meta.page;
          this.reportLoading = false;
        },
        error: () => {
          this.reportLoading = false;
          this.showModal('Error al cargar el reporte', true);
        },
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadReport();
  }

  prevPage(): void {
    if (this.page <= 1) {
      return;
    }
    this.page -= 1;
    this.loadReport();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) {
      return;
    }
    this.page += 1;
    this.loadReport();
  }

  studentLabel(row: AutomaticPromotionRow): string {
    const last = row.studentLastName ?? '';
    const first = row.studentFirstName ?? '';
    const name = `${last}, ${first}`.replace(/^,\s*|,\s*$/g, '').trim();
    return name || '—';
  }

  sourceLabel(source: AutomaticPromotionSource): string {
    switch (source) {
      case 'live':
        return 'En vivo';
      case 'backfill':
        return 'Cron / manual';
      default:
        return 'Histórico';
    }
  }

  sourceBadgeClass(source: AutomaticPromotionSource): string {
    switch (source) {
      case 'live':
        return 'badge-live';
      case 'backfill':
        return 'badge-backfill';
      default:
        return 'badge-legacy';
    }
  }

  showModal(message: string, isError = false, isSuccess = false): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () => this.closeModal(),
    };
    setTimeout(() => this.closeModal(), 2500);
  }

  closeModal(): void {
    this.modal = modalInitializer();
  }
}
