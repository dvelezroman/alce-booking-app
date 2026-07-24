import { CommonModule } from '@angular/common'
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-scheduled-meetings-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './scheduled-meetings-filters.component.html',
  styleUrl: './scheduled-meetings-filters.component.scss',
})
export class ScheduledMeetingsFiltersComponent {
  @Input() searchTerm = ''
  @Input() selectedDateFilter = 'all'
  @Input() selectedStatusFilter = 'all'
  @Input() selectedView: 'list' | 'grid' = 'list'

  @Output() searchTermChange = new EventEmitter<string>()
  @Output() selectedDateFilterChange = new EventEmitter<string>()
  @Output() selectedStatusFilterChange = new EventEmitter<string>()
  @Output() selectedViewChange = new EventEmitter<'list' | 'grid'>()

  onSearchChange(value: string): void {
    this.searchTermChange.emit(value)
  }

  onDateFilterChange(value: string): void {
    this.selectedDateFilterChange.emit(value)
  }

  onStatusFilterChange(value: string): void {
    this.selectedStatusFilterChange.emit(value)
  }

  onViewChange(view: 'list' | 'grid'): void {
    this.selectedViewChange.emit(view)
  }
}