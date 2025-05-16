import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../services/reports.service';
import { MeetingDataI, MeetingReportDetailed, StatisticalDataI } from '../../services/dtos/meeting-theme.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { ReportsStudentFilterComponent } from '../../components/reports/reports-student-filter/reports-student-filter.component';
import { ReportsResultsComponent } from '../../components/reports/reports-results/reports-results.component';

@Component({
  selector: 'app-reports-detailed',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ReportsStudentFilterComponent,
    ReportsResultsComponent
  ],
  templateUrl: './reports-detailed.component.html',
  styleUrl: './reports-detailed.component.scss'
})
export class ReportsDetailedComponent {

  selectedStudentId?: number;
  reportData: MeetingReportDetailed[] = [];
  statisticalData: StatisticalDataI | null = null;
  meetingsData: MeetingDataI[] = [];
  searchAttempted: boolean = false;
  showReportButtons = false;
  activeReport: 'detailed' | 'statistical' | 'meetings' = 'detailed';
  isReportGenerated = false;
  modalData: ModalDto = modalInitializer();
  lastFilters?: { studentId: number; from?: string; to?: string };

  constructor(private reportsService: ReportsService) {}

  onFiltersSubmitted(filters: { studentId: number; from?: string; to?: string; stageId?: number }) {
    this.selectedStudentId = filters.studentId;
    this.lastFilters = filters;
    this.searchAttempted = true;
    this.showReportButtons = true;
    this.isReportGenerated = false;
    this.activeReport = 'detailed';

    this.reportsService.getDetailedStatistics(
      filters.studentId,
      filters.from!,
      filters.to!,
      filters.stageId
    ).subscribe({
      next: (data) => {
        this.reportData = data || [];
        this.isReportGenerated = this.reportData.length > 0;
      },
      error: () => {
        this.reportData = [];
        this.isReportGenerated = false;
      }
    });
  }

  fetchDetailedReport() {
    if (!this.lastFilters) return;

    this.activeReport = 'detailed';
    this.isReportGenerated = false;

    this.reportsService.getDetailedStatistics(
      this.lastFilters.studentId,
      this.lastFilters.from!,
      this.lastFilters.to!
    ).subscribe({
      next: (data) => {
        this.reportData = data || [];
        this.isReportGenerated = this.reportData.length > 0;
      },
      error: () => {
        this.reportData = [];
        this.isReportGenerated = false;
      }
    });
  }

  fetchStatisticalReport() {
    if (!this.lastFilters) return;

    this.activeReport = 'statistical';

    this.reportsService.getStatisticsByStudentId(
      this.lastFilters.studentId,
      this.lastFilters.from!,
      this.lastFilters.to!
    ).subscribe({
      next: (data) => {
        this.statisticalData = data;
      },
      error: () => {
        console.error('Error al obtener estadísticas');
        this.statisticalData = null;
      }
    });
  }

  fetchMeetingsReport() {
    if (!this.lastFilters) return;

    this.activeReport = 'meetings';

    this.reportsService.getMeetingsByStudentId(
      this.lastFilters.studentId,
      this.lastFilters.from!,
      this.lastFilters.to!
    ).subscribe({
      next: (data) => {
        this.meetingsData = data || [];
      },
      error: () => {
        this.meetingsData = [];
        console.error('Error al obtener el reporte de clases');
      }
    });
  }

  openDownloadModal() {
    if (!this.isReportGenerated || !this.lastFilters) return;

    this.modalData = {
      show: true,
      message: '¿Desea descargar el documento?',
      isError: false,
      isInfo: false,
      isSuccess: false,
      close: () => this.closeModal(),
      confirm: () => this.confirmDownload()
    };
  }

  closeModal() {
    this.modalData.show = false;
  }

  confirmDownload() {
    if (!this.lastFilters) return;

    const { studentId, from, to } = this.lastFilters;

    const reportType = {
      type: 'GET_DETAIL_REPORT',
      label: `Reporte_detallado_estudianteId_${studentId}`
    };

    this.reportsService.getCsvReport(
      reportType.type,
      studentId,
      from!,
      to!
    ).subscribe((blob) => {
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `${reportType.label}_${from}_${to}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });

    this.closeModal();
  }
  
}