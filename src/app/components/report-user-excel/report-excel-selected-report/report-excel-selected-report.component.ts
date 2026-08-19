import {
  Component,
  Input,
} from '@angular/core';

export type ReportExcelMode =
  | 'users'
  | 'absents'
  | 'without-meetings';

@Component({
  selector: 'app-report-excel-selected-report',
  standalone: true,
  imports: [],
  templateUrl: './report-excel-selected-report.component.html',
  styleUrl: './report-excel-selected-report.component.scss',
})
export class ReportExcelSelectedReportComponent {

  @Input() currentMode: ReportExcelMode =
    'users';

  get title(): string {
    switch (this.currentMode) {
      case 'absents':
        return 'Estudiantes ausentes';

      case 'without-meetings':
        return 'Estudiantes sin clases agendadas';

      case 'users':
      default:
        return 'Usuarios';
    }
  }

  get description(): string {
    switch (this.currentMode) {
      case 'absents':
        return 'Genera un reporte de estudiantes que no asistieron a clases en el rango seleccionado.';

      case 'without-meetings':
        return 'Genera un reporte de estudiantes activos sin clases agendadas en el rango seleccionado.';

      case 'users':
      default:
        return 'Genera un reporte general con la información de los usuarios del sistema.';
    }
  }
}