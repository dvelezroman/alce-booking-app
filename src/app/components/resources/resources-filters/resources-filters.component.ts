import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resources-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './resources-filters.component.html',
  styleUrl: './resources-filters.component.scss'
})
export class ResourcesFiltersComponent {

  @Input() searchTerm = '';
  @Input() selectedStatus = 'all';

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();

  @Output() search = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();


  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
  }


  onStatusChange(value: string): void {
    this.selectedStatus = value;
    this.statusChange.emit(value);
  }


  onSearch(): void {
    this.search.emit();
  }


  onClearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';

    this.searchTermChange.emit('');
    this.statusChange.emit('all');
    this.clearFilters.emit();
  }


  onEnter(): void {
    this.onSearch();
  }

}