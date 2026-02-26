import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Stage } from '../../../services/dtos/student.dto';
import { StudyContentService } from '../../../services/study-content.service';

@Component({
  selector: 'app-content-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-selector.component.html',
  styleUrl: './content-selector.component.scss'
})
export class ContentSelectorComponent {

  @Input() stages: Stage[] = [];

  @Output() contentIdsSelected = new EventEmitter<number[]>();

  @Output() stepStateChanged = new EventEmitter<{
    stageSelected: boolean;
    topicsSelected: boolean;
    confirmed: boolean;
  }>();

  selectedStageId: number | null = null;
  availableContents: { id: number; name: string }[] = [];
  selectedContents: { id: number; name: string }[] = [];
  hasError: boolean = false;

  constructor(private studyContentService: StudyContentService) {}

  // ================================
  // STEP STATE EMITTER
  // ================================
  private emitStepState(confirmed: boolean = false) {
    this.stepStateChanged.emit({
      stageSelected: !!this.selectedStageId,
      topicsSelected: this.selectedContents.length > 0,
      confirmed
    });
  }

  // ================================
  // STAGE CHANGE
  // ================================
  onStageChange() {
    if (!this.selectedStageId) {
      this.availableContents = [];
      // this.selectedContents = [];
      this.emitStepState(false);
      return;
    }

    this.studyContentService.filterBy(this.selectedStageId).subscribe(contents => {
      this.availableContents = contents
        .filter(c => c.enabled)
        .map(c => ({
          id: c.id,
          name: `Unidad ${c.unit}: ${c.title}`
        }));

      // this.selectedContents = [];
      this.emitStepState(false);
    });
  }

  // ================================
  // ADD CONTENT
  // ================================
  addContent(event: Event) {
    const target = event.target as HTMLSelectElement;
    const contentId = Number(target.value);
    const content = this.availableContents.find(c => c.id === contentId);

    if (content && !this.selectedContents.some(c => c.id === contentId)) {
      this.selectedContents.push(content);
    }

    target.value = '';
    this.emitStepState(false);
  }

  isSelected(contentId: number): boolean {
    return this.selectedContents.some(c => c.id === contentId);
  }

  // ================================
  // REMOVE CONTENT
  // ================================
  removeContent(contentId: number) {
    this.selectedContents = this.selectedContents.filter(c => c.id !== contentId);
    this.emitStepState(false);
  }

  // ================================
  // CONFIRM SELECTION
  // ================================
  confirmSelection() {
    const ids = this.selectedContents.map(c => c.id);

    this.contentIdsSelected.emit(ids);

    // Aquí marcamos el paso 3 como completado
    this.emitStepState(true);
  }

}