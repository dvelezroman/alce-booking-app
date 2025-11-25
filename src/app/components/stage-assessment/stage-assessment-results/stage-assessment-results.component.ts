import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageProgressByStage, StageProgressDto } from '../../../services/dtos/stage-progress.dto';

@Component({
  selector: 'app-stage-assessment-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage-assessment-results.component.html',
  styleUrls: ['./stage-assessment-results.component.scss']
})
export class StageAssessmentResultsComponent implements OnChanges {

  @Input() progressList: StageProgressByStage = [];
  @Input() resetSelection: boolean = false;

  /** IDs seleccionados */
  selectedStudentIds: number[] = [];
  @Output() selectionChange = new EventEmitter<number[]>();

  ngOnChanges() {
    if (this.resetSelection) {
      this.selectedStudentIds = [];
      this.selectionChange.emit([]);
    }
  }

  getColor(progress: number): string {
    const hue = 280 - (progress * 0.9);
    return `hsl(${hue}, 75%, 65%)`;
  }

  /** Seleccionar o deseleccionar */
  toggleSelection(item: StageProgressDto): void {
    const id = item.studentId;

    if (this.selectedStudentIds.includes(id)) {
      this.selectedStudentIds = this.selectedStudentIds.filter(x => x !== id);
    } else {
      this.selectedStudentIds.push(id);
    }

    //console.log('Seleccionados:', this.selectedStudentIds);
    this.selectionChange.emit(this.selectedStudentIds);
  }

  /** Saber si está seleccionado */
  isSelected(id: number): boolean {
    return this.selectedStudentIds.includes(id);
  }
}