import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterMeetingsDto } from '../../../services/dtos/booking.dto';
import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-meeting-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting-filter.component.html',
  styleUrls: ['./meeting-filter.component.scss']
})
export class MeetingFilterComponent {
  @Input() filter!: FilterMeetingsDto;
  @Input() stages: Stage[] = [];
  @Input() availableHours: number[] = [];
  @Input() ageGroupOptions: string[] = [];
  @Output() filterChange = new EventEmitter<FilterMeetingsDto>();

  showForm = true;


  onChange() {
    this.filterChange.emit(this.filter);
 }

  emitFilterChange() {
    this.filterChange.emit({ ...this.filter });
  }

  toggleFormVisibility() {
    this.showForm = !this.showForm;
  }
}