import { Component, OnInit } from '@angular/core';
import { StagesService } from '../../services/stages.service';
import { CommonModule } from '@angular/common';
import { Stage } from '../../services/dtos/student.dto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { UserDto } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';
import { ReportsService } from '../../services/reports.service';
import {
  Meeting,
  MeetingDataI,
  MeetingReportDetailed,
  MeetingThemeDto,
  StatisticalDataI
} from '../../services/dtos/meeting-theme.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import {LuxonDatePipe} from "../../shared/utils/locale-date.pipe";

@Component({
  selector: 'app-reports-detailed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    LuxonDatePipe,
  ],
  templateUrl: './reports-detailed.component.html',
  styleUrl: './reports-detailed.component.scss'
})
export class ReportsDetailedComponent implements OnInit {
  detailedForm: FormGroup;
  stages: Stage[] = [];
  students: UserDto[] = [];
  filteredStudents: UserDto[] = [];
  showDropdown: boolean = false;
  selectedStudentId: number | undefined;
  selectedStudentName: string = '';
  reportData: MeetingReportDetailed[] = [];
  statisticalData: StatisticalDataI | null  = null;
  meetingsData: MeetingDataI[] = [];
  searchAttempted: boolean = false;
  showReportButtons = false;
  activeReport: 'detailed' | 'statistical' | 'meetings' = 'detailed';
  isReportGenerated = false;
  modalData: ModalDto = modalInitializer();

  constructor(private fb: FormBuilder,
              private stagesService: StagesService,
              private usersService: UsersService,
              private reportsService: ReportsService) {

    this.detailedForm = this.fb.group({
        studentName: ['', Validators.required],
        from: ['', Validators.required],
        to: ['', Validators.required],
        stageId: [''],
    });
 }

  ngOnInit() {
    this.stagesService.getAll().subscribe((stages: Stage[]) => {
      this.stages = stages;
    });
    this.loadStudents();
  }

  loadStudents() {
    this.usersService.searchUsers(0, undefined, undefined, undefined, undefined, undefined, 'STUDENT')
      .subscribe({
        next: (result) => {
          this.students = result.users;
        },
        error: (error) => {
          console.error('Error al cargar estudiantes:', error);
        }
      });
  }

  filterStudents() {
    const query = this.detailedForm.get('studentName')?.value.trim().toLowerCase();

    if (query.length > 0 && query !== this.selectedStudentName?.toLowerCase()) {
      this.filteredStudents = this.students.filter(student =>
        (student.firstName + ' ' + student.lastName).toLowerCase().includes(query)
      );
      this.showDropdown = true;
    } else {
      this.filteredStudents = [];
      this.showDropdown = false;
    }
  }

  selectStudent(user: UserDto) {
    this.detailedForm.patchValue({
      studentName: `${user.firstName} ${user.lastName}`
    });
    this.selectedStudentId = user.student?.id;
    this.selectedStudentName = this.detailedForm.get('studentName')?.value;
    this.showDropdown = false;
  }

  hideDropdown() {
    setTimeout(() => (this.showDropdown = false), 300);
  }

  onSubmit() {
    if (this.detailedForm.invalid) {
      this.detailedForm.markAllAsTouched();
      return;
    }
    this.showReportButtons = true;
    this.isReportGenerated = false;
    this.searchAttempted = true;
    this.activeReport = 'detailed';
    const formData = {
      studentId: this.selectedStudentId,
      from: this.formatDate(this.detailedForm.get('from')?.value),
      to: this.formatDate(this.detailedForm.get('to')?.value),
      stageId: this.detailedForm.get('stageId')?.value || undefined,
    };

    //console.log('datos enviados:', formData);

    this.reportsService.getDetailedStatistics(
      formData.studentId!,
      formData.from,
      formData.to,
      formData.stageId
    ).subscribe({
      next: (data: MeetingReportDetailed[]) => {
        this.reportData = data || [];
        this.isReportGenerated = this.reportData.length > 0;
        //console.log('respuesta del backend:', this.reportData);
      },
      error: () => {
        this.isReportGenerated = false;
        this.reportData = [];
      }
    });
  }

  fetchStatisticalReport() {
  if (!this.selectedStudentId) return;

  const formData = {
    studentId: this.selectedStudentId,
    from: this.formatDate(this.detailedForm.get('from')?.value),
    to: this.formatDate(this.detailedForm.get('to')?.value),
    stageId: this.detailedForm.get('stageId')?.value || undefined,
  };

  this.reportsService.getStatisticsByStudentId(
    formData.studentId!,
    formData.from,
    formData.to,
    formData.stageId
  ).subscribe({
    next: (data) => {
      //console.log('Respuesta del backend (estadístico):', data);
      this.activeReport = 'statistical';
      this.statisticalData = data;
    },
    error: (error) => {
      console.error('Error al obtener estadísticas:', error);
      this.statisticalData = null;
    }
  });
}

fetchMeetingsReport() {
  this.activeReport = 'meetings';

  const formData = {
    studentId: this.selectedStudentId,
    from: this.formatDate(this.detailedForm.get('from')?.value),
    to: this.formatDate(this.detailedForm.get('to')?.value),
    stageId: this.detailedForm.get('stageId')?.value || undefined,
  };

  this.reportsService.getMeetingsByStudentId(
    formData.studentId!,
    formData.from,
    formData.to,
    formData.stageId
  ).subscribe({
    next: (data) => {
      //console.log(data);
      this.meetingsData = data || [];
    },
    error: (error) => {
      this.meetingsData = [];
      console.error('Error al obtener el reporte de clases:', error);
    }
  });
}

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

openDownloadModal() {
  if (!this.isReportGenerated) return;

  this.modalData = {
    show: true,
    message: '¿Desea descargar el documento?',
    isError: false,
    isSuccess: false,
    close: () => this.closeModal(),
    confirm: () => this.confirmDownload()
  };
}

closeModal() {
  this.modalData.show = false;
}

  confirmDownload() {
    const formData = {
      studentId: this.selectedStudentId,
      from: this.formatDate(this.detailedForm.get('from')?.value),
      to: this.formatDate(this.detailedForm.get('to')?.value),
      stageId: this.detailedForm.get('stageId')?.value || undefined,
    };
    const getReportType = () => {
      switch (this.activeReport) {
        case "detailed": return ({ type: 'GET_DETAIL_REPORT', label: `Reporte_detallado_estudianteId_${formData.studentId}` });
        case "meetings": return ({ type: 'GET_MEETINGS', label: `Reporte_total_clases_estudianteId_${formData.studentId}` });
        default: return ({ type: 'GET_MEETING_STATISTICS_BY_STUDENT_ID', label: `Reporte_estadistico_estudianteId_${formData.studentId}` });
      }
    }
    const reportType = getReportType();
    this.reportsService.getCsvReport(
      reportType.type,
      formData.studentId!,
      formData.from,
      formData.to,
      formData.stageId
    ).subscribe((blob) => {
        const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `report${reportType.label}_${formData.from}_${formData.to}.csv`;
        a.click();
      window.URL.revokeObjectURL(url); // Clean up
    });
    this.closeModal();
  }


  summaryReport() {
    const fromControl = this.detailedForm.get('from');
    const toControl = this.detailedForm.get('to');

    if (!fromControl?.value || !toControl?.value) {
        fromControl?.markAsTouched();
        toControl?.markAsTouched();
        return; 
    }
    
    const from = this.formatDate(fromControl.value);
    const to = this.formatDate(toControl.value);
    const stageId = this.detailedForm.get('stageId')?.value || undefined;
  
    this.reportsService.getCsvSummaryReport(
      "GET_MEETING_STATISTICS_BY_STUDENT_ID",
      0, 
      from || '',  
      to || '',
      stageId
    ).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `resumen-general-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (error) => {
        console.error("Error al descargar el resumen general:", error);
      },
    });
  }
}
