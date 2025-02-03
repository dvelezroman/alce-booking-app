import { Component, OnInit } from '@angular/core';
import { StagesService } from '../../services/stages.service';
import { CommonModule } from '@angular/common';
import { Stage } from '../../services/dtos/student.dto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { UserDto } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';
import { ReportsService } from '../../services/reports.service';
import {Meeting, MeetingReportDetailed, MeetingThemeDto} from '../../services/dtos/meeting-theme.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-reports-detailed',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      ModalComponent
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
  statisticalData: MeetingThemeDto[] = [];
  meetingsData: Meeting[] = [];
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
      error: (error) => {
        //console.error('Error al obtener el reporte:', error);
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

      if (data?.report) {
        this.statisticalData = [data.report];
        this.activeReport = 'statistical';
      } else {
        this.statisticalData = [];
      }
    },
    error: (error) => {
      console.error('Error al obtener estadísticas:', error);
      this.statisticalData = [];
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
      this.meetingsData = data.meetings || [];
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
    const reportType = () => {
      switch (this.activeReport) {
        case "detailed": return 'GET_DETAIL_REPORT'
        case "meetings": return 'GET_MEETINGS'
        default: return 'GET_MEETING_STATISTICS_BY_STUDENT_ID'
      }
    }
    this.reportsService.getCsvReport(
      reportType(),
      formData.studentId!,
      formData.from,
      formData.to,
      formData.stageId
    ).subscribe({
      next: (blob: Blob) => {
        // Create a URL for the blob
        const downloadUrl = window.URL.createObjectURL(blob);
        // Create a temporary link element
        const a = document.createElement('a');
        a.href = downloadUrl;
        // Optionally, set a filename for the download
        a.download = 'report.csv';
        // Append the link to the document (it needs to be in the DOM for Firefox)
        document.body.appendChild(a);
        // Programmatically click the link to trigger the download
        a.click();
        // Cleanup: remove the link and revoke the object URL
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (error) => {
        this.meetingsData = [];
        console.error('Error al obtener el reporte de clases:', error);
      }
    });
    this.closeModal();
  }
}
