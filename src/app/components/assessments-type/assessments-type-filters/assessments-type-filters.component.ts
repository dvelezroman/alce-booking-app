import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessments-type-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './assessments-type-filters.component.html',
  styleUrl: './assessments-type-filters.component.scss'
})
export class AssessmentsTypeFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() searchTerm = '';

  @Input() selectedStatus = 'all';


  /* =========================
     OUTPUTS
  ========================= */

  @Output() searchTermChange =
    new EventEmitter<string>();

  @Output() statusChange =
    new EventEmitter<string>();

  @Output() search =
    new EventEmitter<void>();

  @Output() clearFilters =
    new EventEmitter<void>();


  /* =========================
     EVENTS
  ========================= */

  onSearchTermChange(
    value: string
  ): void {

    this.searchTerm = value;

    this.searchTermChange.emit(value);
  }


  onStatusChange(
    value: string
  ): void {

    this.selectedStatus = value;

    this.statusChange.emit(value);
  }


  onSearch(): void {
    this.search.emit();
  }


  onEnter(): void {
    this.onSearch();
  }


  onClearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'all';

    this.searchTermChange.emit('');

    this.statusChange.emit('all');

    this.clearFilters.emit();
  }

}