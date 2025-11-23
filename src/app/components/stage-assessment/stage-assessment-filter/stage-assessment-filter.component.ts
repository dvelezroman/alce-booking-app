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
      next: (stages) => {
        this.stages = this.prepareStages(stages);
      },
      error: () => (this.stages = []),
    });
  }

  // MÉTODO PRINCIPAL Aplica filtro + ordenamiento
  private prepareStages(stages: Stage[]): Stage[] {
    const valid = this.filterValidStages(stages);
    return this.sortStages(valid);
  }


   // 1) FILTRA SOLO ACTIVITIES + STG 0–19
  private filterValidStages(stages: Stage[]): Stage[] {
    return stages.filter((s) => {
      const num = s.number?.trim().toUpperCase();

      if (num === "ACTIVITIES") return true;

      // STG 0 a STG 19 
      return /^STG\s*(1?\d|0)$/.test(num);
    });
  }

   // 2) ORDENA: ACTIVITIES → STG 0 → STG 1 → … STG 19 
  private sortStages(stages: Stage[]): Stage[] {
    const activities = stages.find(s => s.number.toUpperCase() === "ACTIVITIES");
    const withoutActivities = stages.filter(s => s.number.toUpperCase() !== "ACTIVITIES");

    // Orden STG 0 → STG 19
    withoutActivities.sort((a, b) => {
      const aNum = parseInt(a.number.replace("STG", "").trim(), 10);
      const bNum = parseInt(b.number.replace("STG", "").trim(), 10);
      return aNum - bNum;
    });

    return activities ? [activities, ...withoutActivities] : withoutActivities;
  }

  onStageChange() {
    if (this.selectedStageId) {
      this.stageSelected.emit(this.selectedStageId);
    }
  }

  onSubmit() {
    if (!this.selectedStageId) return;
    this.stageSelected.emit(this.selectedStageId);
  }
}