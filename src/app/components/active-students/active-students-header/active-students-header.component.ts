import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-active-students-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './active-students-header.component.html',
  styleUrl: './active-students-header.component.scss',
})
export class ActiveStudentsHeaderComponent {

  @Output() historyRequested =
    new EventEmitter<void>();


  onHistory(): void {
    this.historyRequested.emit();
  }
}