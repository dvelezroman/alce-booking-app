import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type SelectionType = 'group' | 'diffusion' | 'contact' | null;

@Component({
  selector: 'app-broadcast-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './broadcast-filters.component.html',
  styleUrls: ['./broadcast-filters.component.scss'],
})
export class BroadcastFiltersComponent {
  @Input() selectedType: SelectionType = null;

  @Output() typeChange = new EventEmitter<SelectionType>();

  onTypeChange(value: string) {
    this.selectedType = value as SelectionType;
    this.typeChange.emit(this.selectedType);
  }
}