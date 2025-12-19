import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Stage } from '../../../services/dtos/student.dto';
import { StagesService } from '../../../services/stages.service';

import { UserDto } from '../../../services/dtos/user.dto';
import { UserSelectorComponent } from '../../notifications/user-selector/user-selector.component';

export type SuspensionHistoryFilters = {
  studentId?: number;
  stageId?: number;
};

@Component({
  selector: 'app-suspension-history-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, UserSelectorComponent],
  templateUrl: './suspension-history-filters.component.html',
  styleUrls: ['./suspension-history-filters.component.scss'],
})
export class SuspensionHistoryFiltersComponent implements OnInit {
  stages: Stage[] = [];
  selectedStageId: number | null = null;

  selectedStudent: UserDto | null = null;

  resetUsersTrigger = 0;
  @Input() maxSelectable: number | null = null;

  @Output() filtersChange = new EventEmitter<SuspensionHistoryFilters>();

  constructor(private stagesService: StagesService) {}

  ngOnInit(): void {
    this.loadStages();
  }

  // ============================
  // LOAD STAGES (MISMA LÓGICA)
  // ============================

  private loadStages() {
    this.stagesService.getAll().subscribe({
      next: (stages) => (this.stages = this.prepareStages(stages)),
      error: () => (this.stages = []),
    });
  }

  private prepareStages(stages: Stage[]): Stage[] {
    const valid = this.filterValidStages(stages);
    return this.sortStages(valid);
  }

  private filterValidStages(stages: Stage[]): Stage[] {
    return stages.filter((s) => {
      const num = s.number?.trim().toUpperCase();
      if (num === 'ACTIVITIES') return true;
      return /^STG\s*(1?\d|0)$/.test(num);
    });
  }

  private sortStages(stages: Stage[]): Stage[] {
    const activities = stages.find((s) => s.number?.toUpperCase() === 'ACTIVITIES');
    const withoutActivities = stages.filter((s) => s.number?.toUpperCase() !== 'ACTIVITIES');

    withoutActivities.sort((a, b) => {
      const aNum = parseInt(a.number.replace('STG', '').trim(), 10);
      const bNum = parseInt(b.number.replace('STG', '').trim(), 10);
      return aNum - bNum;
    });

    return activities ? [activities, ...withoutActivities] : withoutActivities;
  }

  // ============================
  // USER SELECTOR
  // ============================

  onStudentSelected(users: UserDto[]) {
    this.selectedStudent = users[0] || null;
  }

  // ============================
  // APPLY / CLEAR
  // ============================

  applyFilters() {
    const filters: SuspensionHistoryFilters = {};

    if (this.selectedStageId) filters.stageId = this.selectedStageId;
    if (this.selectedStudent?.student?.id) filters.studentId = this.selectedStudent.student.id;

    this.filtersChange.emit(filters);
  }

  clearFilters() {
    this.selectedStageId = null;
    this.selectedStudent = null;

    this.resetUsersTrigger++;
    this.filtersChange.emit({});
  }
}