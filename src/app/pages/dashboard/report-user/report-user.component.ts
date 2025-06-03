import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ReportFormComponent } from '../../../components/reports-user/report-user-form/report-user-form.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ReportUserTableComponent } from '../../../components/reports-user/report-user-table/report-user-table.component';
import { UserDto } from '../../../services/dtos/user.dto';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-report-user',
  standalone: true,
  imports: [CommonModule, ReportFormComponent, ReportUserTableComponent, ModalComponent],
  templateUrl: './report-user.component.html',
  styleUrl: './report-user.component.scss'
})
export class ReportUserComponent {
  modal: ModalDto = modalInitializer();
  users: UserDto[] = [];

  constructor() {}

  handleFormSubmit(filters: {
    studentId: number;
    studentStage?: string;
    status?: 'active' | 'inactive' | null;
    withAlerts?: boolean | null;
  }): void {
    console.log('Filtros recibidos:', filters);

  }

 handleStageClick(studentId: number, currentStageDescription: string): void {
    // this.studyContentService.getStageHistoryByStudentId(studentId).subscribe({
    //   next: (history) => {
    //     let message = `<div class="stage-history">`;

    //     for (const item of history) {
    //       const from = DateTime.fromISO(item.from);
    //       const to = item.to ? DateTime.fromISO(item.to) : DateTime.now();
    //       const days = to.diff(from, 'days').days;

    //       message += `
    //         <div class="stage-block">
    //           <div>${item.stage}</div><br>
    //           Desde: ${from.toFormat('dd/MM/yyyy')}<br>
    //           ${item.to ? `Hasta: ${to.toFormat('dd/MM/yyyy')}<br>` : ''}
    //           Días: ${Math.floor(days)}
    //         </div>
    //         <hr>
    //       `;
    //     }

    //     message += `</div>`;

    //     this.modal = {
    //       ...modalInitializer(),
    //       show: true,
    //       isContentViewer: true,
    //       isError: false,
    //       message,
    //       title: 'Historial de Stages',
    //       close: () => this.modal.show = false,
    //     };
    //   },
    //   error: () => {
    //     this.modal = {
    //       ...modalInitializer(),
    //       show: true,
    //       isError: true,
    //       isSuccess: false,
    //       message: 'No se pudo cargar el historial de stages del estudiante.',
    //       title: 'Error',
    //       close: () => this.modal.show = false,
    //     };
    //   },
    // });
  }
}
