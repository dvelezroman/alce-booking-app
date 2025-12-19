import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StudentSuspensionHistory } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-suspension-history-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suspension-history-table.component.html',
  styleUrl: './suspension-history-table.component.scss',
})
export class SuspensionHistoryTableComponent {
  @Input() data: StudentSuspensionHistory[] = [];
}
