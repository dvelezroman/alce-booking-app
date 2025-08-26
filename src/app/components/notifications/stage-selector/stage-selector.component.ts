import { Component, Input, Output, EventEmitter } from '@angular/core';
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
export class StageSelectorComponent {
  @Input() stages: Stage[] = [];
  @Output() stageSelected = new EventEmitter<Stage | null>(); 

  selectedStageId: string = ''; 

  onStageChange(event: Event) {
    const stageId = (event.target as HTMLSelectElement).value;

    if (!stageId) {
      this.stageSelected.emit(null);
      return;
    }

    const selected = this.stages.find(stage => stage.id === +stageId);
    if (selected) {
      this.stageSelected.emit(selected);
    }
  }
}