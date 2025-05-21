import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyContentDto, StudyContentPayloadI } from '../../../services/dtos/study-content.dto';

@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss']
})
export class ReportTableComponent {
  @Input() history: StudyContentPayloadI[] = [];
  @Input() stageContents: StudyContentDto[] = [];
  @Input() stageDescription?: string;
  @Input() studentStageDescription?: string;
  @Input() canGoPrevious: boolean = false;
  @Input() canGoNext: boolean = false;

  @Output() previousStage = new EventEmitter<void>();
  @Output() nextStage = new EventEmitter<void>();
  @Output() hasVisibleResults = new EventEmitter<boolean>();

  hoveredColumnIndex: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    this.hasVisibleResults.emit(this.stageContents.length > 0 && this.history.length > 0);
  }

  getInstructorName(record: any): string {
    const instructor = record?.instructors?.[0];
    if (!instructor) {
      return 'Instructor no disponible';
    }

    const firstName = instructor.firstName ?? 'No disponible';
    const lastName = instructor.lastName ?? 'No disponible';
    return `${lastName}, ${firstName}`;
  }

  getRecordsByContentTitle(title: string): StudyContentPayloadI[] {
    return this.history.filter(r => r.data?.title === title);
  }

  onPreviousStage() {
    this.previousStage.emit();
  }

  onNextStage() {
    this.nextStage.emit();
  }

  onMouseEnterColumn(index: number): void {
    this.hoveredColumnIndex = index;
  }

  onMouseLeaveColumn(): void {
    this.hoveredColumnIndex = null;
  }
}