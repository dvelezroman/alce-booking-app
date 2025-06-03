import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ReportFormComponent } from '../../../components/reports-user/report-user-form/report-user-form.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-report-user',
  standalone: true,
  imports: [CommonModule, ReportFormComponent, ModalComponent],
  templateUrl: './report-user.component.html',
  styleUrl: './report-user.component.scss'
})
export class ReportUserComponent {
modal: ModalDto = modalInitializer();

  handleFormSubmit(filters: {
    studentId: number;
    studentStage?: string;
    status?: 'active' | 'inactive' | null;
    withAlerts?: boolean | null;
  }): void {
    console.log('Filtros recibidos:', filters);

  }
}
