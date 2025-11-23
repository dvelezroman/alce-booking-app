import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Stage } from '../../../services/dtos/student.dto';
import { StagesService } from '../../../services/stages.service';

@Component({
  selector: 'app-stage-assessment-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stage-assessment-filter.component.html',
  styleUrl: './stage-assessment-filter.component.scss',
})
export class StageAssessmentFilterComponent implements OnInit {
  stages: Stage[] = [];
  selectedStageId: number | null = null;

  @Output() stageSelected = new EventEmitter<number>();

  constructor(private stagesService: StagesService) {}

  ngOnInit(): void {
    this.stagesService.getAll().subscribe({
      next: (stages) => (this.stages = stages),
      error: () => (this.stages = []),
    });
  }

  onStageChange() {
    const id = this.selectedStageId ? Number(this.selectedStageId) : undefined;
    if (id) {
      this.stageSelected.emit(id);
    }
  }

  onSubmit() {
    if (!this.selectedStageId) return;
    this.stageSelected.emit(this.selectedStageId);
  }
}
