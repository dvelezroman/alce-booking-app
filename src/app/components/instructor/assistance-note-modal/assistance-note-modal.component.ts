import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assistance-note-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistance-note-modal.component.html',
  styleUrls: ['./assistance-note-modal.component.scss']
})
export class AssistanceNoteModalComponent {

  @Input() show: boolean = false;

  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  note: string = '';

  onSave() {
    this.save.emit(this.note.trim());
    this.note = '';
  }

  onCancel() {
    this.note = '';
    this.cancel.emit();
  }
}