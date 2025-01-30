import { Component, OnInit } from '@angular/core';
import { StagesService } from '../../services/stages.service';
import { CommonModule } from '@angular/common';
import { Stage } from '../../services/dtos/student.dto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { UserDto } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';
import { ReportsService } from '../../services/reports.service';
import { Meeting, MeetingThemeDto } from '../../services/dtos/meeting-theme.dto';

@Component({
  selector: 'app-reports-detailed',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule
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
  reportData: MeetingThemeDto[] = [];
  statisticalData: MeetingThemeDto[] = []; 
  meetingsData: Meeting[] = [];
  searchAttempted: boolean = false;
  showReportButtons = false;
  activeReport: 'detailed' | 'statistical' | 'meetings' = 'detailed';

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
      next: (data: MeetingThemeDto[]) => {  
        this.reportData = data || [];  
        //console.log('respuesta del backend:', this.reportData);
      },
      error: (error) => {
        //console.error('Error al obtener el reporte:', error);
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
}
