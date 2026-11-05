import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { Instructor } from '../../../services/dtos/instructor.dto';
import { Stage } from '../../../services/dtos/student.dto';
import {
  DistractedDatePreset,
  DistractedGroupBy,
  DistractedMeetingRowDto,
  DistractedStudentRowDto,
  DistractedStudentsFilterDto,
  DistractedStudentsListResponseDto,
} from '../../../services/dtos/reports.dto';
import { InstructorsService } from '../../../services/instructors.service';
import { ReportsService } from '../../../services/reports.service';
import { StagesService } from '../../../services/stages.service';

@Component({
  selector: 'app-distracted-students-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './distracted-students-report.component.html',
  styleUrl: './distracted-students-report.component.scss',
})
export class DistractedStudentsReportComponent implements OnInit {
  loading = false;
  exporting = false;
  error: string | null = null;

  stages: Stage[] = [];
  instructors: Instructor[] = [];
  report: DistractedStudentsListResponseDto | null = null;

  preset: DistractedDatePreset = 'today';
  groupBy: DistractedGroupBy = 'meeting';
  from = '';
  to = '';
  searchText = '';
  stageId: number | null = null;
  instructorId: number | null = null;
  category: 'KIDS' | 'TEENS' | 'ADULTS' | null = null;
  studentId: number | null = null;
  meetingId: number | null = null;
  classDate = '';
  classHour: number | null = null;
  hasBehaviorComment = false;
  page = 1;
  readonly limit = 20;

  readonly hours = Array.from({ length: 16 }, (_, index) => index + 6);

  constructor(
    private reportsService: ReportsService,
    private stagesService: StagesService,
    private instructorsService: InstructorsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const meetingId = Number(params.get('meetingId'));
    const studentId = Number(params.get('studentId'));
    this.meetingId = Number.isFinite(meetingId) && meetingId > 0 ? meetingId : null;
    this.studentId = Number.isFinite(studentId) && studentId > 0 ? studentId : null;

    this.stagesService.getAll().subscribe({
      next: (stages) => {
        this.stages = stages;
      },
    });
    this.instructorsService.getAll('ACTIVE').subscribe({
      next: (instructors) => {
        this.instructors = instructors;
      },
    });

    if (this.meetingId || this.studentId) {
      this.applyPreset('30');
    } else {
      this.applyPreset('today');
    }
  }

  get meetingRows(): DistractedMeetingRowDto[] {
    return this.report?.groupBy === 'meeting'
      ? (this.report.items as DistractedMeetingRowDto[])
      : [];
  }

  get studentRows(): DistractedStudentRowDto[] {
    return this.report?.groupBy === 'student'
      ? (this.report.items as DistractedStudentRowDto[])
      : [];
  }

  get totalPages(): number {
    if (!this.report?.limit) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.report.total / this.report.limit));
  }

  applyPreset(preset: DistractedDatePreset): void {
    this.preset = preset;
    const today = this.today();
    if (preset === 'today') {
      this.from = today;
      this.to = today;
      this.search();
      return;
    }
    if (preset === '7') {
      this.from = this.shiftDays(6);
      this.to = today;
      this.search();
      return;
    }
    if (preset === '30') {
      this.from = this.shiftDays(29);
      this.to = today;
      this.search();
    }
  }

  search(): void {
    this.page = 1;
    this.load();
  }

  setGroupBy(groupBy: DistractedGroupBy): void {
    if (this.groupBy === groupBy) {
      return;
    }
    this.groupBy = groupBy;
    this.search();
  }

  openStudentClasses(studentId: number): void {
    this.studentId = studentId;
    this.groupBy = 'meeting';
    this.search();
  }

  clearStudent(): void {
    this.studentId = null;
    this.search();
  }

  clearMeeting(): void {
    this.meetingId = null;
    this.search();
  }

  previousPage(): void {
    if (this.page <= 1) {
      return;
    }
    this.page -= 1;
    this.load();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) {
      return;
    }
    this.page += 1;
    this.load();
  }

  downloadExcel(): void {
    if (!this.from || !this.to) {
      return;
    }
    this.exporting = true;
    this.reportsService.downloadDistractedStudentsExcel(this.filters(false)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `distraidos-${this.groupBy}_${this.from}_${this.to}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => {
        this.error = 'No se pudo descargar el Excel.';
        this.exporting = false;
      },
    });
  }

  personName(person?: { firstName?: string | null; lastName?: string | null } | null): string {
    return `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim() || 'Sin nombre';
  }

  hourLabel(hour: number | null | undefined): string {
    if (hour == null) {
      return '—';
    }
    return `${String(hour).padStart(2, '0')}:00`;
  }

  private load(): void {
    if (!this.from || !this.to) {
      this.error = 'Selecciona un rango de fechas.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.reportsService.getDistractedStudents(this.filters(true)).subscribe({
      next: (report) => {
        this.report = report;
        this.loading = false;
      },
      error: () => {
        this.report = null;
        this.error = 'No se pudo cargar el reporte.';
        this.loading = false;
      },
    });
  }

  private filters(includePage: boolean): DistractedStudentsFilterDto {
    return {
      from: this.from,
      to: this.to,
      groupBy: this.groupBy,
      page: includePage ? this.page : undefined,
      limit: includePage ? this.limit : undefined,
      studentId: this.studentId,
      meetingId: this.groupBy === 'meeting' ? this.meetingId : null,
      classDate: this.groupBy === 'meeting' ? this.classDate || null : null,
      classHour: this.groupBy === 'meeting' ? this.classHour : null,
      stageId: this.stageId,
      instructorId: this.instructorId,
      category: this.category,
      search: this.searchText,
      hasBehaviorComment: this.hasBehaviorComment,
    };
  }

  private today(): string {
    return DateTime.now().setZone('America/Guayaquil').toISODate() ?? '';
  }

  private shiftDays(days: number): string {
    return (
      DateTime.now().setZone('America/Guayaquil').minus({ days }).toISODate() ??
      this.today()
    );
  }
}
