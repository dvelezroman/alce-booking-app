import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Stage } from '../../../services/dtos/student.dto';
import { StageAssessmentFilters } from '../../../services/dtos/stage-assessment.dto';

import { StagesService } from '../../../services/stages.service';
import { StageAssessmentResource } from '../../../services/dtos/stage-resources.dto';
import { StageAssessmentResourcesService } from '../../../services/stage-assessment-resources.service';

import { UserDto } from '../../../services/dtos/user.dto';
import { UserSelectorComponent } from '../../notifications/user-selector/user-selector.component';

@Component({
  selector: 'app-assessment-filters',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    UserSelectorComponent,
  ],
  templateUrl: './assessment-filters.component.html',
  styleUrls: ['./assessment-filters.component.scss'],
})
export class AssessmentFiltersComponent implements OnInit {

  stages: Stage[] = [];
  selectedStageId: number | null = null;

  selectedAdmin: UserDto | null = null;
  selectedStudent: UserDto | null = null;

  resources: StageAssessmentResource[] = [];
  selectedResourceId: number | null = null;

  resetUsersTrigger = 0;

  @Output() filtersChange = new EventEmitter<StageAssessmentFilters>();

  constructor(
    private stagesService: StagesService,
    private resourcesService: StageAssessmentResourcesService
  ) {}

  ngOnInit(): void {
    this.loadStages();
    this.loadResources();
  }

  // ============================
  // LOADERS
  // ============================

  private loadStages() {
    this.stagesService.getAll().subscribe({
      next: (stages) => this.stages = this.prepareStages(stages),
      error: () => this.stages = [],
    });
  }

  private loadResources() {
    this.resourcesService.getAll().subscribe({
      next: (res) => this.resources = res,
      error: () => this.resources = [],
    });
  }

  // ============================
  // STAGE: FILTRAR + ORDENAR
  // ============================

  private prepareStages(stages: Stage[]): Stage[] {
    const valid = this.filterValidStages(stages);
    return this.sortStages(valid);
  }

  private filterValidStages(stages: Stage[]): Stage[] {
    return stages.filter(s => {
      const num = s.number?.trim().toUpperCase();
      if (num === 'ACTIVITIES') return true;
      return /^STG\s*(1?\d|0)$/.test(num);
    });
  }

  private sortStages(stages: Stage[]): Stage[] {
    const activities = stages.find(s => s.number.toUpperCase() === 'ACTIVITIES');
    const withoutActivities = stages.filter(s => s.number.toUpperCase() !== 'ACTIVITIES');

    withoutActivities.sort((a, b) => {
      const aNum = parseInt(a.number.replace('STG', '').trim(), 10);
      const bNum = parseInt(b.number.replace('STG', '').trim(), 10);
      return aNum - bNum;
    });

    return activities ? [activities, ...withoutActivities] : withoutActivities;
  }

  // ============================
  // HANDLERS DEL SELECTOR DE USERS
  // ============================

  onAdminSelected(users: UserDto[]) {
    this.selectedAdmin = users[0] || null;
  }

  onStudentSelected(users: UserDto[]) {
    this.selectedStudent = users[0] || null;
  }

  // ============================
  // APPLY FILTERS
  // ============================

  applyFilters() {
    const filters: StageAssessmentFilters = {};

    if (this.selectedStageId) filters.stageId = this.selectedStageId;
    if (this.selectedResourceId) filters.stageAssessmentResourceId = this.selectedResourceId;

    if (this.selectedAdmin) filters.createdBy = this.selectedAdmin.id;
    if (this.selectedStudent?.student?.id) filters.studentId = this.selectedStudent.student.id;

    this.filtersChange.emit(filters);
  }

  clearFilters() {
    this.selectedStageId = null;
    this.selectedAdmin = null;
    this.selectedStudent = null;
    this.selectedResourceId = null;

    this.resetUsersTrigger++;

    this.filtersChange.emit({});
  }
}