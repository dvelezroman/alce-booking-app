import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-student-history-generate-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-history-generate-report.component.html',
  styleUrl: './student-history-generate-report.component.scss'
})
export class StudentHistoryGenerateReportComponent {
  @Input() student?: UserDto;
  @Input() loading = false;

  @Output() generateRequested =
    new EventEmitter<void>();

  get canGenerate(): boolean {
    return !!this.student?.student?.id && !this.loading;
  }

  onGenerate(): void {
    if (!this.canGenerate) return;

    this.generateRequested.emit();
  }
}