import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-composer.component.html',
  styleUrls: ['./message-composer.component.scss'],
})
export class MessageComposerComponent {
  message: string = '';

  @Output() messageChange = new EventEmitter<string>();

  onBlur() {
    this.messageChange.emit(this.message);
  }

  get charCount(): number {
    return this.message.length;
  }

  readonly maxChars = 4096;
}