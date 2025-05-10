import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyContentService } from '../../services/study-content.service';
import { Stage } from '../../services/dtos/student.dto';
import { FormsModule } from '@angular/forms';

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

  selectedStageId: number | null = null;
  availableContents: { id: number; name: string }[] = [];
  selectedContents: { id: number; name: string }[] = [];

  constructor(private studyContentService: StudyContentService) {}

  onStageChange() {
    if (!this.selectedStageId) {
      this.availableContents = [];
      return;
    }

    this.studyContentService.filterBy(this.selectedStageId).subscribe(contents => {
      this.availableContents = contents.map(c => ({
        id: c.id,
        name: `Unidad ${c.unit}: ${c.title}`
      }));
    });
  }

 addContent(event: Event) {
  const target = event.target as HTMLSelectElement | null;

  if (!target || !target.value) {
    return; 
  }
  const contentId = Number(target.value);
  const content = this.availableContents.find(c => c.id === contentId);

  if (content && !this.selectedContents.find(c => c.id === contentId)) {
    this.selectedContents.push(content);
  }

  target.value = '';
}

  removeContent(contentId: number) {
    this.selectedContents = this.selectedContents.filter(c => c.id !== contentId);
  }

  private emitSelectedContentIds() {
    const ids = this.selectedContents.map(c => c.id);
    this.contentIdsSelected.emit(ids);
  }

  confirmSelection() {
  this.emitSelectedContentIds();
}
}