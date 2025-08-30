import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stage } from '../../../services/dtos/student.dto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stage-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stage-selector.component.html',
  styleUrls: ['./stage-selector.component.scss']
})
export class StageSelectorComponent implements OnChanges {
  @Input() stages: Stage[] = [];
  @Input() reset = false;
  @Input() totalUsers: number | null = null;
  @Output() stageSelected = new EventEmitter<number | null>();

  selectedStageId: string = '';
  totalUsersInStage: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reset'] && this.reset) {
      this.clearSelection();
    }
  }

  onStageChange(event: Event) {
    const stageId = +(event.target as HTMLSelectElement).value;
    this.stageSelected.emit(stageId || null);
  }

  private clearSelection(): void {
    this.selectedStageId = '';
    this.stageSelected.emit(null);
  }
}