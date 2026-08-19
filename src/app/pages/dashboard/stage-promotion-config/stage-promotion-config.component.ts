import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import {
  AutomaticPromotionRow,
  AutomaticPromotionSource,
  EligiblePromotionPreview,
  StagePromotionReportCategory,
} from '../../../services/dtos/assessment.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-stage-promotion-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, RouterLink],
  templateUrl: './stage-promotion-config.component.html',
  styleUrl: './stage-promotion-config.component.scss',
})
export class StagePromotionConfigComponent implements OnInit {
  cronEnabled = true;
  cronLoading = false;
  previewLoading = false;
  promoteLoading = false;
  reportLoading = false;

  showPreviewPanel = false;
  previewRows: EligiblePromotionPreview[] = [];
  selectedStudentIds = new Set<number>();

  from = '';
  to = '';
  search = '';
  reportCategory: StagePromotionReportCategory = 'automatic';
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

  get selectedCount(): number {
    return this.selectedStudentIds.size;
  }

  get allPreviewSelected(): boolean {
    return (
      this.previewRows.length > 0 &&
      this.selectedStudentIds.size === this.previewRows.length
    );
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

  openPreview(): void {
    this.previewLoading = true;
    this.showPreviewPanel = true;
    this.previewRows = [];
    this.selectedStudentIds = new Set();

    this.assessmentService.previewPromoteEligible().subscribe({
      next: (rows) => {
        this.previewRows = rows;
        this.selectedStudentIds = new Set(rows.map((row) => row.studentId));
        this.previewLoading = false;
      },
      error: () => {
        this.previewLoading = false;
        this.showPreviewPanel = false;
        this.showModal('Error al cargar alumnos elegibles', true);
      },
    });
  }

  closePreviewPanel(): void {
    if (this.promoteLoading) {
      return;
    }
    this.showPreviewPanel = false;
    this.previewRows = [];
    this.selectedStudentIds = new Set();
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedStudentIds = new Set(
        this.previewRows.map((row) => row.studentId),
      );
      return;
    }
    this.selectedStudentIds = new Set();
  }

  toggleStudent(studentId: number, checked: boolean): void {
    const next = new Set(this.selectedStudentIds);
    if (checked) {
      next.add(studentId);
    } else {
      next.delete(studentId);
    }
    this.selectedStudentIds = next;
  }

  isStudentSelected(studentId: number): boolean {
    return this.selectedStudentIds.has(studentId);
  }

  promoteSelected(): void {
    const studentIds = [...this.selectedStudentIds];
    if (studentIds.length === 0) {
      return;
    }

    this.promoteLoading = true;
    this.assessmentService.promoteEligible(studentIds).subscribe({
      next: (result) => {
        this.promoteLoading = false;
        this.closePreviewPanel();
        this.showModal(
          `Promovidos: ${result.promoted} de ${studentIds.length} seleccionados.`,
          false,
          true,
        );
        this.loadReport();
      },
      error: () => {
        this.promoteLoading = false;
        this.showModal('Error al promover alumnos seleccionados', true);
      },
    });
  }

  previewStudentLabel(row: EligiblePromotionPreview): string {
    const name = `${row.lastName}, ${row.firstName}`
      .replace(/^,\s*|,\s*$/g, '')
      .trim();
    return name || '—';
  }

  loadReport(): void {
    this.reportLoading = true;
    this.assessmentService
      .listAutomaticPromotions({
        category: this.reportCategory,
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

  processorLabel(row: AutomaticPromotionRow): string {
    const last = row.processedByLastName ?? '';
    const first = row.processedByFirstName ?? '';
    const name = `${last}, ${first}`.replace(/^,\s*|,\s*$/g, '').trim();
    if (name) {
      return name;
    }
    if (row.source === 'live') {
      return 'Sistema (evaluación)';
    }
    if (row.source === 'backfill') {
      return 'Sistema (cron)';
    }
    return '—';
  }

  hasPromotionScores(row: AutomaticPromotionRow): boolean {
    return row.grammarPoints != null && row.speakingPoints != null;
  }

  sourceLabel(source: AutomaticPromotionSource): string {
    switch (source) {
      case 'live':
        return 'En vivo';
      case 'backfill':
        return 'Cron';
      case 'manual':
        return 'Manual (Ejecutar ahora)';
      case 'profile':
        return 'Manual (perfil)';
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
      case 'manual':
        return 'badge-manual';
      case 'profile':
        return 'badge-profile';
      default:
        return 'badge-legacy';
    }
  }

  reportCategoryLabel(category: StagePromotionReportCategory): string {
    switch (category) {
      case 'automatic':
        return 'Automáticas (todas)';
      case 'live':
        return 'En vivo';
      case 'backfill':
        return 'Cron';
      case 'manual':
        return 'Manual (Ejecutar ahora)';
      case 'profile':
        return 'Manual (perfil de alumno)';
      default:
        return 'Automáticas';
    }
  }

  emptyReportHint(): string {
    switch (this.reportCategory) {
      case 'manual':
        return 'Aún no hay promociones desde Ejecutar ahora en este rango.';
      case 'profile':
        return 'No hay cambios de stage hechos manualmente en el perfil del alumno.';
      case 'backfill':
        return 'No hay promociones registradas por el cron en este rango.';
      case 'live':
        return 'No hay promociones en vivo en este rango.';
      default:
        return 'Ajusta las fechas o ejecuta el barrido manual para procesar alumnos pendientes.';
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
