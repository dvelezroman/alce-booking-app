import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SuspensionInfo } from '../../../services/dtos/user.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-suspension-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-suspension-modal.component.html',
  styleUrl: './student-suspension-modal.component.scss'
})
export class StudentSuspensionModalComponent {
@Input() suspensionInfo!: SuspensionInfo;
@Output() close = new EventEmitter<void>();
}
