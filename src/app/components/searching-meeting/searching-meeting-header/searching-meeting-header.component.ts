import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-searching-meeting-header',
  standalone: true,
  imports: [],
  templateUrl: './searching-meeting-header.component.html',
  styleUrl: './searching-meeting-header.component.scss',
})
export class SearchingMeetingHeaderComponent {

  @Input() selectedCount = 0;

  @Output()
  assignRequested = new EventEmitter<void>();

  get hasSelection(): boolean {
    return this.selectedCount > 0;
  }

  onAssignRequested(): void {
    if (!this.hasSelection) {
      return;
    }

    this.assignRequested.emit();
  }
}