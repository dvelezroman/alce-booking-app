import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-searching-meeting-selection-summary',
  standalone: true,
  imports: [],
  templateUrl: './searching-meeting-selection-summary.component.html',
  styleUrl: './searching-meeting-selection-summary.component.scss',
})
export class SearchingMeetingSelectionSummaryComponent {

  @Input()
  selectedCount = 0;

  @Input()
  disabled = false;

  @Output()
  assignRequested = new EventEmitter<void>();

  get selectedMeetingsLabel(): string {
    if (this.selectedCount === 1) {
      return '1 reunión seleccionada';
    }

    return `${this.selectedCount} reuniones seleccionadas`;
  }

  get hasSelection(): boolean {
    return this.selectedCount > 0;
  }

  onAssignRequested(): void {
    if (
      this.disabled ||
      !this.hasSelection
    ) {
      return;
    }

    this.assignRequested.emit();
  }
}