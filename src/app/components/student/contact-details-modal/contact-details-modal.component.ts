import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserDto } from '../../../services/dtos/user.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-details-modal',
  templateUrl: './contact-details-modal.component.html',
  styleUrls: ['./contact-details-modal.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ContactDetailsModalComponent {
  @Input() showModal: boolean = false;
  @Input() user: UserDto | null = null;

  @Output() close = new EventEmitter<void>();

  handleClose(): void {
    this.close.emit();
  }
}