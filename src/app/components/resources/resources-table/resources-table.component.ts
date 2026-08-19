import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  AssessmentResourceI,
} from '../../../services/dtos/assessment-resources.dto';


@Component({
  selector: 'app-resources-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './resources-table.component.html',
  styleUrl: './resources-table.component.scss',
})
export class ResourcesTableComponent implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input() resources: AssessmentResourceI[] = [];
  @Input() isLoading = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() viewResource =
    new EventEmitter<AssessmentResourceI>();

  @Output() editResource =
    new EventEmitter<AssessmentResourceI>();

  @Output() deleteResource =
    new EventEmitter<AssessmentResourceI>();


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
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {
    if (
      changes['resources'] &&
      this.currentPage > this.totalPages
    ) {
      this.currentPage =
        this.totalPages;
    }
  }


  /* =========================
     MENU
  ========================= */

  toggleMenu(
    event: MouseEvent,
    resourceId: number,
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
    resourceId: number,
  ): boolean {
    return (
      this.openMenuId === resourceId
    );
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
    resource: AssessmentResourceI,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    this.viewResource.emit(
      resource,
    );
  }


  onEdit(
    event: MouseEvent,
    resource: AssessmentResourceI,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    this.editResource.emit(
      resource,
    );
  }


  onDelete(
    event: MouseEvent,
    resource: AssessmentResourceI,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    this.deleteResource.emit(
      resource,
    );
  }


  /* =========================
     PAGINATION
  ========================= */

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.resources.length /
        this.pageSize,
      ),
    );
  }


  get paginatedResources():
    AssessmentResourceI[] {

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

    return this.resources.slice(
      start,
      start + this.pageSize,
    );
  }


  get visiblePages(): number[] {
    const total =
      this.totalPages;

    const maxVisible = 5;

    if (
      total <=
      maxVisible
    ) {
      return Array.from(
        {
          length: total,
        },
        (_, index) =>
          index + 1,
      );
    }

    let start =
      this.currentPage - 2;

    let end =
      this.currentPage + 2;

    if (
      start < 1
    ) {
      start = 1;
      end = maxVisible;
    }

    if (
      end > total
    ) {
      end = total;
      start =
        total -
        maxVisible +
        1;
    }

    return Array.from(
      {
        length:
          end -
          start +
          1,
      },
      (_, index) =>
        start + index,
    );
  }


  get startItem(): number {
    if (
      !this.resources.length
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
      this.resources.length,
    );
  }


  goToPage(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.closeMenu();

    this.currentPage =
      page;
  }


  previousPage(): void {
    this.goToPage(
      this.currentPage - 1,
    );
  }


  nextPage(): void {
    this.goToPage(
      this.currentPage + 1,
    );
  }


  /* =========================
     HELPERS
  ========================= */

  getResourceNote(
    resource: AssessmentResourceI,
  ): string {
    const resourceWithNote =
      resource as AssessmentResourceI & {
        note?: string;
      };

    return (
      resourceWithNote.note ||
      'Sin nota registrada'
    );
  }


  shouldOpenMenuUp(
    index: number,
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
    resource: AssessmentResourceI,
  ): number {
    return resource.id;
  }


  trackByPage(
    _: number,
    page: number,
  ): number {
    return page;
  }
}