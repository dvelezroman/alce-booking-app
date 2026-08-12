import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ContentSelectorComponent } from '../../contenido/content-selector/content-selector.component';

import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-instructor-content-preparation-panel',
  standalone: true,
  imports: [
    CommonModule,
    ContentSelectorComponent,
  ],
  templateUrl: './instructor-content-preparation-panel.component.html',
  styleUrl: './instructor-content-preparation-panel.component.scss',
})
export class InstructorContentPreparationPanelComponent {
  @Input() stages: Stage[] = [];

  @Input() studyContentIds: number[] = [];

  @Input() studyContentOptions: {
    id: number;
    name: string;
  }[] = [];

  @Input() stepState: {
    stageSelected: boolean;
    topicsSelected: boolean;
    confirmed: boolean;
  } = {
    stageSelected: false,
    topicsSelected: false,
    confirmed: false,
  };

  @Output() contentIdsSelected = new EventEmitter<number[]>();

  @Output() stepStateChanged = new EventEmitter<{
    stageSelected: boolean;
    topicsSelected: boolean;
    confirmed: boolean;
  }>();

  @Output() clearSelectedContents = new EventEmitter<void>();

  @Output() closePanel = new EventEmitter<void>();

  onContentIdsSelected(ids: number[]): void {
    this.contentIdsSelected.emit(ids);
  }

  onStepStateChanged(state: {
    stageSelected: boolean;
    topicsSelected: boolean;
    confirmed: boolean;
  }): void {
    this.stepStateChanged.emit(state);
  }

  onClearSelectedContents(): void {
    this.clearSelectedContents.emit();
  }

  onClosePanel(): void {
    this.closePanel.emit();
  }

  get hasSelectedContents(): boolean {
    return this.studyContentIds.length > 0;
  }

  get selectedContentsCount(): number {
    return this.studyContentIds.length;
  }

  trackByContentId(
    index: number,
    content: { id: number; name: string },
  ): number {
    return content.id;
  }
}