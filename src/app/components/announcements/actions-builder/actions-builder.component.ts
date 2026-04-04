import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type ActionType = 'action' | 'close' | 'whatsapp';

export interface ActionButton {
  id: string;
  type: ActionType;
  label: string;
  url?: string;
  color?: string;
  delaySeconds?: number;
}

@Component({
  selector: 'app-actions-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actions-builder.component.html',
  styleUrl: './actions-builder.component.scss'
})
export class ActionsBuilderComponent {

  delayOptions = [10, 15, 20, 30, 40, 50, 60];

  @Input() actions: ActionButton[] = [];

  @Output() add = new EventEmitter<ActionType>();
  @Output() update = new EventEmitter<{ id: string; updates: Partial<ActionButton> }>();
  @Output() remove = new EventEmitter<string>();
  @Output() error = new EventEmitter<string>();

  // MAPA DE COLORES
  colorMap: Record<string, string> = {
    blue: '#28336f',
    gray: '#6b7280',
    gold: '#d4af37'
  };

  onAdd() {

    if (this.actions.length >= 3) {
      this.error.emit('Máximo 3 botones');
      return;
    }

    const types: ActionType[] = ['action', 'whatsapp', 'close'];

    const nextType = types.find(t => !this.actions.some(a => a.type === t));

    if (!nextType) return;

    this.add.emit(nextType);
  }

  onUpdate(id: string, updates: Partial<ActionButton>) {

    if (updates.type) {

      const alreadyExists = this.isTypeAlreadyUsed(updates.type, id);

      if (alreadyExists) {
        this.error.emit(`Ya existe un botón de tipo "${updates.type}"`);
        return;
      }

      // =====================
      // CONFIG POR TIPO
      // =====================

      if (updates.type === 'whatsapp') {
        updates.label = 'WhatsApp';
        updates.color = '#25D366';
      }

      if (updates.type === 'close') {
        updates.label = 'Cerrar';
        updates.url = undefined;
        updates.color = undefined;
      }

      if (updates.type === 'action') {
        updates.label = '';
        updates.color = '#28336f';
      }
    }

    // COLOR
    if ((updates as any).colorKey) {
      const key = (updates as any).colorKey;
      updates.color = this.colorMap[key];
      delete (updates as any).colorKey;
    }

    // DELAY
    if (updates.delaySeconds !== undefined) {
      const value = Number(updates.delaySeconds);
      updates.delaySeconds = isNaN(value) ? 0 : Math.max(0, value);
    }

    this.update.emit({ id, updates });
  }

  onRemove(id: string) {
    this.remove.emit(id);
  }

  trackById(index: number, item: ActionButton) {
    return item.id;
  }

  onColorChange(id: string, colorKey: string) {
    const color = this.colorMap[colorKey];
    this.update.emit({ id, updates: { color } });
  }

  isTypeAlreadyUsed(type: ActionType, currentId: string): boolean {
  return this.actions.some(a => a.type === type && a.id !== currentId);
}

  getNextAvailableType(): ActionType | null {

    const types: ActionType[] = ['action', 'whatsapp', 'close'];

    for (const type of types) {
      const exists = this.actions.some(a => a.type === type);
      if (!exists) return type;
    }

    return null; // ya están todos
  }
}