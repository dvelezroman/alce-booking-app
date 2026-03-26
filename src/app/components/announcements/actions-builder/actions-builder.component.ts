import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ActionType = 'interest' | 'lead' | 'link' | 'close';

export interface ActionButton {
  id: string;
  type: ActionType;
  label: string;
  url?: string;
}

@Component({
  selector: 'app-actions-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actions-builder.component.html',
  styleUrl: './actions-builder.component.scss'
})
export class ActionsBuilderComponent {

  @Input() actions: ActionButton[] = [];

  @Output() add = new EventEmitter<void>();
  @Output() update = new EventEmitter<{ id: string; updates: Partial<ActionButton> }>();
  @Output() remove = new EventEmitter<string>();

  onAdd() {
    this.add.emit();
  }

  onUpdate(id: string, updates: Partial<ActionButton>) {
    this.update.emit({ id, updates });
  }

  onRemove(id: string) {
    this.remove.emit(id);
  }
}