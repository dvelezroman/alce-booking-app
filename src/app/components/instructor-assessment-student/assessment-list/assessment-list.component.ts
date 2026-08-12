import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
  AssessementI,
  AssessmentType,
} from '../../../services/dtos/assessment.dto';

import { UserDto } from '../../../services/dtos/user.dto';

import { AssessmentItemComponent } from '../assessment-item/assessment-item.component';


@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [
    CommonModule,
    AssessmentItemComponent,
  ],
  templateUrl: './assessment-list.component.html',
  styleUrl: './assessment-list.component.scss',
})
export class AssessmentListComponent {

  @Input() assessments: AssessementI[] = [];
  @Input() selectedStudent: UserDto | null = null;
  @Input() currentStageId: number | null = null;
  @Input() minPointsAssessment: number | null = null;
  @Input() hasSearched: boolean = false;


  /* =========================
     PAGINATION
  ========================= */

  previousPage: number = 1;

  previousPageSize: number = 5;


  /* =========================
     CURRENT STAGE ASSESSMENTS
  ========================= */

  get currentStageAssessments(): AssessementI[] {
    if (this.currentStageId == null) {
      return [];
    }

    return this.assessments
      .filter(
        assessment =>
          assessment.stageId === this.currentStageId
      )
      .sort(
        (a, b) =>
          this.getAssessmentTimestamp(b) -
          this.getAssessmentTimestamp(a)
      );
  }


  /* =========================
     PREVIOUS STAGE ASSESSMENTS
  ========================= */

  get previousStageAssessments(): AssessementI[] {
    if (this.currentStageId == null) {
      return [];
    }

    return this.assessments
      .filter(
        assessment =>
          assessment.stageId !== this.currentStageId
      )
      .sort((a, b) => {

        /*
         * Primero ordenamos por stage:
         * Stage 6
         * Stage 5
         * Stage 4
         * ...
         */
        const stageDifference =
          b.stageId - a.stageId;

        if (stageDifference !== 0) {
          return stageDifference;
        }

        /*
         * Dentro del mismo stage,
         * más reciente primero.
         */
        return (
          this.getAssessmentTimestamp(b) -
          this.getAssessmentTimestamp(a)
        );
      });
  }


  /* =========================
     PAGINATED PREVIOUS
  ========================= */

  get paginatedPreviousStageAssessments(): AssessementI[] {
    const start =
      (this.previousPage - 1) *
      this.previousPageSize;

    const end =
      start +
      this.previousPageSize;

    return this.previousStageAssessments.slice(
      start,
      end
    );
  }


  get totalPreviousPages(): number {
    return Math.ceil(
      this.totalPreviousStageAssessments /
      this.previousPageSize
    );
  }


  get previousPageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPreviousPages,
      },
      (_, index) => index + 1
    );
  }


  get canGoPreviousPage(): boolean {
    return this.previousPage > 1;
  }


  get canGoNextPage(): boolean {
    return (
      this.previousPage <
      this.totalPreviousPages
    );
  }


  /* =========================
     PAGINATION ACTIONS
  ========================= */

  goToPreviousPage(): void {
    if (!this.canGoPreviousPage) {
      return;
    }

    this.previousPage--;
  }


  goToNextPage(): void {
    if (!this.canGoNextPage) {
      return;
    }

    this.previousPage++;
  }


  goToPreviousPageNumber(
    page: number,
  ): void {

    if (
      page < 1 ||
      page > this.totalPreviousPages
    ) {
      return;
    }

    this.previousPage = page;
  }


  /* =========================
     STATES
  ========================= */

  get hasAssessments(): boolean {
    return this.currentStageAssessments.length > 0;
  }


  get hasPreviousStageAssessments(): boolean {
    return this.previousStageAssessments.length > 0;
  }


  get totalAssessments(): number {
    return this.currentStageAssessments.length;
  }


  get totalPreviousStageAssessments(): number {
    return this.previousStageAssessments.length;
  }


  get totalStudentAssessments(): number {
    return this.assessments.length;
  }


  /* =========================
     APPROVED
  ========================= */

  isAssessmentApproved(
    assessment: AssessementI,
  ): boolean {

    if (
      assessment.points == null ||
      this.minPointsAssessment == null
    ) {
      return false;
    }

    return (
      assessment.points >=
      this.minPointsAssessment
    );
  }


  get approvedAssessmentsCount(): number {
    return this.currentStageAssessments.filter(
      assessment =>
        this.isAssessmentApproved(assessment)
    ).length;
  }


  /* =========================
     ASSESSMENT TYPES
  ========================= */

  get assessmentTypes(): AssessmentType[] {
    const types =
      this.currentStageAssessments.map(
        assessment => assessment.type
      );

    return Array.from(
      new Set(types)
    );
  }


  getAssessmentTypeCount(
    type: AssessmentType,
  ): number {

    return this.currentStageAssessments.filter(
      assessment =>
        assessment.type === type
    ).length;
  }


  isTypeApproved(
    type: AssessmentType,
  ): boolean {

    return this.currentStageAssessments
      .filter(
        assessment =>
          assessment.type === type
      )
      .some(
        assessment =>
          this.isAssessmentApproved(assessment)
      );
  }


  /* =========================
     STUDENT
  ========================= */

  get studentName(): string {
    if (!this.selectedStudent) {
      return '';
    }

    const firstName =
      this.selectedStudent.firstName ?? '';

    const lastName =
      this.selectedStudent.lastName ?? '';

    return `${firstName} ${lastName}`.trim();
  }


  /* =========================
     DISPLAY STATES
  ========================= */

  get shouldShowInitialState(): boolean {
    return (
      !this.selectedStudent &&
      !this.hasSearched
    );
  }


  get shouldShowEmptyState(): boolean {
    return (
      !!this.selectedStudent &&
      this.hasSearched &&
      !this.hasAssessments
    );
  }


  get shouldShowList(): boolean {
    return (
      !!this.selectedStudent &&
      this.hasAssessments
    );
  }


  get shouldShowPreviousStageList(): boolean {
    return (
      !!this.selectedStudent &&
      this.hasPreviousStageAssessments
    );
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByAssessmentId(
    index: number,
    assessment: AssessementI,
  ): number {

    return assessment.id;
  }


  trackByPageNumber(
    index: number,
    page: number,
  ): number {

    return page;
  }


  /* =========================
     HELPERS
  ========================= */

  private getAssessmentTimestamp(
    assessment: AssessementI,
  ): number {

    const createdAt =
      (assessment as any)?.createdAt;

    if (!createdAt) {
      return 0;
    }

    const timestamp =
      new Date(createdAt).getTime();

    return Number.isNaN(timestamp)
      ? 0
      : timestamp;
  }

}