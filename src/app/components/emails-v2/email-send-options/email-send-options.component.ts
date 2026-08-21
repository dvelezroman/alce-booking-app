import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-send-options',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './email-send-options.component.html',
  styleUrl: './email-send-options.component.scss',
})
export class EmailSendOptionsComponent {

  sendCopy = false;
  requestConfirmation = false;
  highPriority = false;

  scheduled = false;
  scheduledDate = '';
  scheduledTime = '';

  toggleScheduled(): void {
    this.scheduled = !this.scheduled;

    if (!this.scheduled) {
      this.scheduledDate = '';
      this.scheduledTime = '';
    }
  }
}