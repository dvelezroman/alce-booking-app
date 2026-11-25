import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Stage } from '../../../services/dtos/student.dto';
import { StagesService } from '../../../services/stages.service';

@Component({
  selector: 'app-stage-resources-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './stage-resources-filters.component.html',
  styleUrl: './stage-resources-filters.component.scss'
})
export class StageResourcesFiltersComponent implements OnInit {

  /* =========================
     INPUTS
  ========================= */

  @Input() selectedStageId: number | null = null;

  @Input() selectedStatus = 'all';


  /* =========================
     OUTPUTS
  ========================= */

  @Output() stageChange =
    new EventEmitter<number | null>();

  @Output() statusChange =
    new EventEmitter<string>();

  @Output() search =
    new EventEmitter<void>();

  @Output() clearFilters =
    new EventEmitter<void>();


  /* =========================
     STAGES
  ========================= */

  stages: { id: number; label: string }[] = [];

  constructor(private stagesService: StagesService) {}

  ngOnInit(): void {
    this.loadStages();
  }

  private loadStages(): void {
    this.stagesService.getAll().subscribe({
      next: (stages) => {
        this.stages = this.prepareStages(stages).map((s) => ({
          id: s.id,
          label: this.stageLabel(s),
        }));
      },
      error: () => {
        this.stages = [];
      },
    });
  }

  private prepareStages(stages: Stage[]): Stage[] {
    const valid = this.filterValidStages(stages);
    return this.sortStages(valid);
  }

  private filterValidStages(stages: Stage[]): Stage[] {
    return stages.filter((s) => {
      const num = s.number?.trim().toUpperCase();
      if (num === 'ACTIVITIES') {
        return true;
      }
      return /^STG\s*(1?\d|0)$/.test(num);
    });
  }

  private sortStages(stages: Stage[]): Stage[] {
    const activities = stages.find(
      (s) => s.number.toUpperCase() === 'ACTIVITIES',
    );
    const list = stages.filter(
      (s) => s.number.toUpperCase() !== 'ACTIVITIES',
    );

    list.sort((a, b) => {
      const aNum = parseInt(a.number.replace('STG', '').trim(), 10);
      const bNum = parseInt(b.number.replace('STG', '').trim(), 10);
      return aNum - bNum;
    });

    return activities ? [activities, ...list] : list;
  }

  private stageLabel(stage: Stage): string {
    const desc = stage.description?.trim();
    return desc ? `${stage.number} — ${desc}` : stage.number;
  }

  /* =========================
     EVENTS
  ========================= */

  onStageChange(
    value: string | number | null
  ): void {

    const stageId =
      value === '' ||
      value === null
        ? null
        : Number(value);

    this.selectedStageId = stageId;

    this.stageChange.emit(stageId);
  }


  onStatusChange(
    value: string
  ): void {

    this.selectedStatus = value;

    this.statusChange.emit(value);
  }


  onSearch(): void {
    this.search.emit();
  }


  onClearFilters(): void {

    this.selectedStageId = null;
    this.selectedStatus = 'all';

    this.stageChange.emit(null);
    this.statusChange.emit('all');

    this.clearFilters.emit();
  }

}