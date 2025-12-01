import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-assessment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-modal.component.html',
  styleUrls: ['./assessment-modal.component.scss'],
})
export class AssessmentModalComponent {

  @Input() show = false;
  @Input() title = '';
  @Input() users: UserDto[] = [];

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}