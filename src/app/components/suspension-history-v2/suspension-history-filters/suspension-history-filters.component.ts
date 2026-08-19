import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-suspension-history-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './suspension-history-filters.component.html',
  styleUrl: './suspension-history-filters.component.scss',
})
export class SuspensionHistoryFiltersComponent {

  @Output()
  filtersChange = new EventEmitter<{
    studentId?: number;
    stageId?: number;
  }>();


  studentId: number | null = null;

  stageId: number | null = null;


  search(): void {
    this.filtersChange.emit({
      studentId: this.studentId || undefined,
      stageId: this.stageId || undefined,
    });
  }


  clearFilters(): void {
    this.studentId = null;
    this.stageId = null;

    this.filtersChange.emit({});
  }
}