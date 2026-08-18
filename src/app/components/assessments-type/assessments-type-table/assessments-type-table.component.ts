import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  AssessmentTypeI
} from '../../../services/dtos/assessment-type.dto';


@Component({
  selector: 'app-assessments-type-table',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './assessments-type-table.component.html',
  styleUrl: './assessments-type-table.component.scss'
})
export class AssessmentsTypeTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() assessmentTypes: AssessmentTypeI[] = [];

  @Input() isLoading = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() viewAssessmentType =
    new EventEmitter<AssessmentTypeI>();

  @Output() editAssessmentType =
    new EventEmitter<AssessmentTypeI>();

  @Output() deleteAssessmentType =
    new EventEmitter<AssessmentTypeI>();


  /* =========================
     MENU
  ========================= */

  openMenuId: number | null = null;


  /* =========================
     PAGINATION
  ========================= */

  currentPage = 1;

  pageSize = 6;


  /* =========================
     MENU
  ========================= */

  toggleMenu(
    event: MouseEvent,
    typeId: number
  ): void {

    event.stopPropagation();

    this.openMenuId =
      this.openMenuId === typeId
        ? null
        : typeId;
  }


  closeMenu(): void {
    this.openMenuId = null;
  }


  isMenuOpen(
    typeId: number
  ): boolean {

    return this.openMenuId === typeId;
  }


  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenu();
  }


  /* =========================
     ACTIONS
  ========================= */

  onView(
    event: MouseEvent,
    type: AssessmentTypeI
  ): void {

    event.stopPropagation();

    this.closeMenu();

    this.viewAssessmentType.emit(type);
  }


  onEdit(
    event: MouseEvent,
    type: AssessmentTypeI
  ): void {

    event.stopPropagation();

    this.closeMenu();

    this.editAssessmentType.emit(type);
  }


  onDelete(
    event: MouseEvent,
    type: AssessmentTypeI
  ): void {

    event.stopPropagation();

    this.closeMenu();

    this.deleteAssessmentType.emit(type);
  }


  /* =========================
     PAGINATION
  ========================= */

  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.assessmentTypes.length /
        this.pageSize
      )
    );
  }


  get paginatedAssessmentTypes():
    AssessmentTypeI[] {

    if (
      this.currentPage >
      this.totalPages
    ) {
      this.currentPage =
        this.totalPages;
    }

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    const end =
      start +
      this.pageSize;

    return this.assessmentTypes.slice(
      start,
      end
    );
  }


  get startItem(): number {

    if (
      this.assessmentTypes.length === 0
    ) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;
  }


  get endItem(): number {

    return Math.min(
      this.currentPage *
      this.pageSize,

      this.assessmentTypes.length
    );
  }


  previousPage(): void {

    if (
      this.currentPage <= 1
    ) {
      return;
    }

    this.closeMenu();

    this.currentPage--;
  }


  nextPage(): void {

    if (
      this.currentPage >=
      this.totalPages
    ) {
      return;
    }

    this.closeMenu();

    this.currentPage++;
  }


  /* =========================
     HELPERS
  ========================= */

  getStatus(
    type: AssessmentTypeI
  ): boolean {

    const typeWithStatus =
      type as AssessmentTypeI & {
        active?: boolean;
      };

    return typeWithStatus.active !== false;
  }


  getDescription(
    type: AssessmentTypeI
  ): string {

    return (
      type.description?.trim() ||
      'Sin descripción'
    );
  }


  getCreatedAt(
    type: AssessmentTypeI
  ): string | Date | null {

    const value =
      type as AssessmentTypeI & {
        createdAt?: string | Date;
        created?: string | Date;
      };

    return (
      value.createdAt ??
      value.created ??
      null
    );
  }


  getUpdatedAt(
    type: AssessmentTypeI
  ): string | Date | null {

    const value =
      type as AssessmentTypeI & {
        updatedAt?: string | Date;
        updated?: string | Date;
      };

    return (
      value.updatedAt ??
      value.updated ??
      null
    );
  }


  formatDate(
    value: string | Date | null
  ): string {

    if (!value) {
      return '-';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '-';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(date);
  }


  formatTime(
    value: string | Date | null
  ): string {

    if (!value) {
      return '-';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '-';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    ).format(date);
  }


  shouldOpenMenuUp(
    index: number
  ): boolean {

    const total =
      this.paginatedAssessmentTypes.length;

    return (
      total > 2 &&
      index >= total - 2
    );
  }


  trackByAssessmentTypeId(
    _: number,
    type: AssessmentTypeI
  ): number | undefined {

    return type.id;
  }

}