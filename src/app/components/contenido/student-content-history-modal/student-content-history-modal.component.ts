import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyContentPayloadI } from '../../../services/dtos/study-content.dto';

@Component({
  selector: 'app-student-content-history-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-content-history-modal.component.html',
  styleUrls: ['./student-content-history-modal.component.scss']
})
export class StudentContentHistoryModalComponent {
  @Input() history: StudyContentPayloadI[] = [];
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
