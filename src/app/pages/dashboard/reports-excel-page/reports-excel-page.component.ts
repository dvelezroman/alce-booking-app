import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { UsersExcelFilterDto, AbsentStudentsExcelFilterDto } from '../../../services/dtos/reports.dto';
import { Instructor } from '../../../services/dtos/instructor.dto';
import { InstructorsService } from '../../../services/instructors.service';
import { StagesService } from '../../../services/stages.service';
import { Stage } from '../../../services/dtos/student.dto';
import { CommonModule } from '@angular/common';
import { ReportsUsersExcelComponent } from '../../../components/reports-users-excel/reports-users-excel.component';

@Component({
  selector: 'app-reports-excel-page',
  standalone: true,
  imports: [ 
      CommonModule,
      ReportsUsersExcelComponent,
    ],
  templateUrl: './reports-excel-page.component.html',
  styleUrl: './reports-excel-page.component.scss'
})
export class ReportsExcelPageComponent implements OnInit {

  loading = false;
  // instructors: Instructor[] = [];
  stages: Stage[] = [];
  currentMode: 'users' | 'absents' = 'users';

  constructor(private reportsService: ReportsService,
             private stagesService: StagesService,
             private instructorsService: InstructorsService) {}

  ngOnInit(): void {
    // this.fetchInstructors();
    this.fetchStages()
  }

  /** Cambiar modo entre usuarios e inasistencias */
  toggleMode(): void {
    this.currentMode = this.currentMode === 'users' ? 'absents' : 'users';
  }

  /** Obtener instructores */
  // private fetchInstructors(): void {
  //   this.instructorsService.getAll().subscribe({
  //     next: (data) => {
  //       this.instructors = data;
  //     },
  //     error: (err) => {
  //       console.error('Error al obtener instructores:', err);
  //       this.instructors = [];
  //     }
  //   });
  // }

   /** Obtener stages (solo STAGE 0 a 19) */
  private fetchStages(): void {
    this.stagesService.getAll().subscribe({
      next: (data) => {
        this.stages = data.filter(stage => {
          const match = stage.number.match(/^STG\s*(\d+)/i);
          if (!match) return false;
          const num = Number(match[1]);
          return num >= 0 && num <= 19;
        });
      },
      error: (err) => {
        console.error(' Error al obtener stages:', err);
        this.stages = [];
      }
    });
  }

  /** Descargar Excel general de usuarios */
  handleDownloadUsersExcel(filters: UsersExcelFilterDto): void {
    this.loading = true;

    this.reportsService.downloadUsersExcel(filters).subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'reporte_usuarios.xlsx');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al descargar Excel de usuarios:', err);
        this.loading = false;
      }
    });
  }

  /** Descargar Excel de estudiantes ausentes por instructor */
  handleDownloadAbsentExcel(filters: AbsentStudentsExcelFilterDto): void {
    this.loading = true;

    this.reportsService.downloadAbsentStudentsExcel(filters).subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'estudiantes_ausentes.xlsx');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al descargar Excel de ausentes:', err);
        this.loading = false;
      }
    });
  }

  /** Utilidad para descarga */
  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}