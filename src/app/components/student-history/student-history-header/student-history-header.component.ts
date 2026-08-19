import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-history-header',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './student-history-header.component.html',
  styleUrl: './student-history-header.component.scss'
})
export class StudentHistoryHeaderComponent {

  @Output()
  historyRequested =
    new EventEmitter<void>();

  openHistory(): void {
    this.historyRequested.emit();
  }

}