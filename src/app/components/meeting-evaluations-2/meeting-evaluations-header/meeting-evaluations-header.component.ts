import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-meeting-evaluations-header',
  standalone: true,
  imports: [],
  templateUrl: './meeting-evaluations-header.component.html',
  styleUrl: './meeting-evaluations-header.component.scss'
})
export class MeetingEvaluationsHeaderComponent {

  @Output() createRequested =
    new EventEmitter<void>();

  onCreate(): void {
    this.createRequested.emit();
  }

}