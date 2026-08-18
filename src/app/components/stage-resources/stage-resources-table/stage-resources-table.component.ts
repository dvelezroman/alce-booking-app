import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  StageAssessmentResource
} from '../../../services/dtos/stage-resources.dto';


@Component({
  selector: 'app-stage-resources-table',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './stage-resources-table.component.html',
  styleUrl: './stage-resources-table.component.scss'
})
export class StageResourcesTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() resources: StageAssessmentResource[] = [];
  @Input() isLoading = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() viewResource =
    new EventEmitter<StageAssessmentResource>();

  @Output() editResource =
    new EventEmitter<StageAssessmentResource>();

  @Output() deleteResource =
    new EventEmitter<StageAssessmentResource>();


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
    resourceId: number
  ): void {

    event.stopPropagation();

    this.openMenuId =
      this.openMenuId === resourceId
        ? null
        : resourceId;
  }


  closeMenu(): void {
    this.openMenuId = null;
  }


  isMenuOpen(
    resourceId: number
  ): boolean {

    return this.openMenuId === resourceId;
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
    resource: StageAssessmentResource
  ): void {

    event.stopPropagation();

    this.closeMenu();

    this.viewResource.emit(resource);
  }


  onEdit(
    event: MouseEvent,
    resource: StageAssessmentResource
  ): void {

    event.stopPropagation();

    this.closeMenu();

    this.editResource.emit(resource);
  }


  onDelete(
    event: MouseEvent,
    resource: StageAssessmentResource
  ): void {

    event.stopPropagation();

    this.closeMenu();

    this.deleteResource.emit(resource);
  }


  /* =========================
     PAGINATION
  ========================= */

  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.resources.length /
        this.pageSize
      )
    );
  }


  get paginatedResources():
    StageAssessmentResource[] {

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

    return this.resources.slice(
      start,
      end
    );
  }


  get startItem(): number {

    if (
      this.resources.length === 0
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

      this.resources.length
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

  getStageLabel(
    resource: StageAssessmentResource
  ): string {

    const value =
      resource as StageAssessmentResource & {
        stage?: {
          number?: number;
          stageNumber?: number;
        };
      };

    const stageNumber =
      value.stage?.number ??
      value.stage?.stageNumber ??
      resource.stageId;

    return `STG ${stageNumber}`;
  }


  formatDate(
    value: string | Date | null | undefined
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
    value: string | Date | null | undefined
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


  getCreatedAt(
    resource: StageAssessmentResource
  ): string | Date | null {

    const value =
      resource as StageAssessmentResource & {
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
    resource: StageAssessmentResource
  ): string | Date | null {

    const value =
      resource as StageAssessmentResource & {
        updatedAt?: string | Date;
        updated?: string | Date;
      };

    return (
      value.updatedAt ??
      value.updated ??
      null
    );
  }


  shouldOpenMenuUp(
    index: number
  ): boolean {

    const total =
      this.paginatedResources.length;

    return (
      total > 2 &&
      index >= total - 2
    );
  }


  trackByResourceId(
    _: number,
    resource: StageAssessmentResource
  ): number {

    return resource.id;
  }

}