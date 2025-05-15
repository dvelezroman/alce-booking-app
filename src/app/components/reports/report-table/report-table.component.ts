import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyContentPayloadI } from '../../../services/dtos/study-content.dto';


@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss']
})
export class ReportTableComponent {
  @Input() history: StudyContentPayloadI[] = [];
}