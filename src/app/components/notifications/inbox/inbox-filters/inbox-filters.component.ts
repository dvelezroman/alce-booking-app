import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inbox-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inbox-filters.component.html',
  styleUrl: './inbox-filters.component.scss',
})
export class InboxFiltersComponent {
  @Input() readDays: number = 30;
  @Output() readDaysChange = new EventEmitter<number>();

  onChange(val: string) {
    const n = Math.max(1, Math.min(365, Number(val) || 1));
    this.readDays = n;
    this.readDaysChange.emit(n);
  }
}