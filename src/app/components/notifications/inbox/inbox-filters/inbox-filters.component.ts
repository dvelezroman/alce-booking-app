// inbox-filters.component.ts
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InboxFilters } from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-inbox-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inbox-filters.component.html',
  styleUrl: './inbox-filters.component.scss',
})
export class InboxFiltersComponent implements OnChanges {
  @Input() value: InboxFilters = {
    status: '',
    type: '',
    scope: '',
    fromDate: '',
    toDate: '',
    priority: '',
    readState: 'all',
    search: '', 
  };
  @Output() valueChange = new EventEmitter<InboxFilters>();

  // locales
  searchLocal = '';
  fromDate = '';
  toDate = '';
  priorityLocal: 0 | 1 | 2 | 3 | '' = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.searchLocal   = this.value?.search ?? '';
      this.fromDate      = this.value?.fromDate ?? '';
      this.toDate        = this.value?.toDate ?? '';
      this.priorityLocal = (this.value?.priority ?? '') as 0 | 1 | 2 | 3 | '';
    }
  }

  private emit() {
    this.valueChange.emit({ ...this.value });
  }

  // ——— Search (solo front) ———
  handleSearchChange(): void {
    const term = (this.searchLocal || '').trim();
    // mínimo 2 letras para aplicar; si no, limpiar
    this.value.search = term.length >= 2 ? term : '';
    this.emit();
  }

  // ——— Prioridad (numérica) ———
  setPriority(level: 0 | 1 | 2 | 3 | ''): void {
    this.priorityLocal = level;
    this.value.priority = level;
    this.emit();
  }

  // ——— Lectura ———
  setReadState(state: 'all' | 'unread' | 'read') {
    if (this.value.readState === state) return;
    this.value.readState = state;
    this.emit();
  }

  // ——— Fechas ———
  onDateChange(): void {
    this.value.fromDate = this.fromDate || '';
    this.value.toDate   = this.toDate   || '';
    this.emit();
  }

  // ——— (Opcionales) status/type/scope ———
  setStatus(status: InboxFilters['status']) {
    this.value.status = status ?? '';
    this.emit();
  }
  setType(type: InboxFilters['type']) {
    this.value.type = (type ?? '') as InboxFilters['type'];
    this.emit();
  }
  setScope(scope: InboxFilters['scope']) {
    this.value.scope = (scope ?? '') as InboxFilters['scope'];
    this.emit();
  }
}