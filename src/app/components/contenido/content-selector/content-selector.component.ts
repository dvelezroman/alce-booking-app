import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Stage } from '../../../services/dtos/student.dto';
import { StudyContentDto } from '../../../services/dtos/study-content.dto';
import { StudyContentService } from '../../../services/study-content.service';

interface ContentSelectorStepState {
  stageSelected: boolean;
  topicsSelected: boolean;
  confirmed: boolean;
}

@Component({
  selector: 'app-content-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './content-selector.component.html',
  styleUrl: './content-selector.component.scss',
})
export class ContentSelectorComponent {
  @Input() stages: Stage[] = [];

  @Output() contentIdsSelected = new EventEmitter<number[]>();

  @Output() stepStateChanged = new EventEmitter<ContentSelectorStepState>();

  selectedStageId: number | null = null;

  contents: StudyContentDto[] = [];

  filteredContents: StudyContentDto[] = [];

  selectedContentIds: number[] = [];

  searchQuery: string = '';

  isLoadingContents: boolean = false;

  isConfirmed: boolean = false;

  constructor(
    private studyContentService: StudyContentService,
  ) {}

  /* =========================
     STAGE
  ========================= */

  onStageChange(): void {
    this.contents = [];
    this.filteredContents = [];
    this.selectedContentIds = [];
    this.searchQuery = '';
    this.isConfirmed = false;

    /*
     * Limpiamos también los contenidos que
     * estaban preparados anteriormente en el padre.
     */
    this.contentIdsSelected.emit([]);

    this.emitStepState();

    if (!this.selectedStageId) {
      return;
    }

    this.loadStageContents(this.selectedStageId);
  }

  private loadStageContents(stageId: number): void {
    this.isLoadingContents = true;

    this.studyContentService.filterBy(stageId).subscribe({
      next: contents => {
        this.contents = contents.filter(
          content =>
            typeof content.unit === 'number' &&
            content.unit > 0,
        );

        this.filteredContents = [...this.contents];
        this.isLoadingContents = false;

        this.emitStepState();
      },

      error: () => {
        this.contents = [];
        this.filteredContents = [];
        this.selectedContentIds = [];
        this.isLoadingContents = false;

        this.emitStepState();
      },
    });
  }

  /* =========================
     SEARCH
  ========================= */

  onSearchChange(): void {
    const query = this.normalizeText(this.searchQuery);

    if (!query) {
      this.filteredContents = [...this.contents];
      return;
    }

    this.filteredContents = this.contents.filter(content => {
      const title = this.normalizeText(content.title ?? '');
      const unit = this.normalizeText(String(content.unit ?? ''));
      const stageNumber = this.normalizeText(
        String(content.stage?.number ?? content.stageId ?? ''),
      );

      return (
        title.includes(query) ||
        unit.includes(query) ||
        stageNumber.includes(query)
      );
    });
  }

  /* =========================
     CONTENT SELECTION
  ========================= */

  toggleContent(contentId: number): void {
    const isSelected = this.selectedContentIds.includes(contentId);

    if (isSelected) {
      this.selectedContentIds = this.selectedContentIds.filter(
        id => id !== contentId,
      );
    } else {
      this.selectedContentIds = [
        ...this.selectedContentIds,
        contentId,
      ];
    }

    /*
     * Si modifica la selección luego de confirmar,
     * debe confirmar nuevamente.
     */
    this.isConfirmed = false;

    this.emitStepState();
  }

  isContentSelected(contentId: number): boolean {
    return this.selectedContentIds.includes(contentId);
  }

  /* =========================
     CONFIRM
  ========================= */

  confirmSelection(): void {
    if (!this.selectedStageId) {
      return;
    }

    if (this.selectedContentIds.length === 0) {
      return;
    }

    this.isConfirmed = true;

    /*
     * Aquí enviamos finalmente los IDs al padre.
     * El padre los almacena en studyContentIds.
     */
    this.contentIdsSelected.emit([
      ...this.selectedContentIds,
    ]);

    this.emitStepState();
  }

  /* =========================
     STEP STATE
  ========================= */

  private emitStepState(): void {
    const state: ContentSelectorStepState = {
      stageSelected: this.selectedStageId !== null,
      topicsSelected: this.selectedContentIds.length > 0,
      confirmed: this.isConfirmed,
    };

    this.stepStateChanged.emit(state);
  }

  /* =========================
     HELPERS
  ========================= */

  trackByContentId(
    index: number,
    content: StudyContentDto,
  ): number {
    return content.id;
  }

  trackByStageId(
    index: number,
    stage: Stage,
  ): number {
    return stage.id;
  }

  get selectedContentsCount(): number {
    return this.selectedContentIds.length;
  }

  get hasSelectedContents(): boolean {
    return this.selectedContentIds.length > 0;
  }

  get canConfirm(): boolean {
    return (
      this.selectedStageId !== null &&
      this.selectedContentIds.length > 0 &&
      !this.isLoadingContents
    );
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}