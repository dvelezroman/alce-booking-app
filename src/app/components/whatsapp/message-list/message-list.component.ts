import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsAppMessage } from '../../../services/dtos/whatssapp-messages.dto';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss'],
})
export class MessageListComponent {
  @Input() messages: WhatsAppMessage[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() messageSelected = new EventEmitter<WhatsAppMessage>();

  onSelectMessage(msg: WhatsAppMessage): void {
    this.messageSelected.emit(msg);
  }
}