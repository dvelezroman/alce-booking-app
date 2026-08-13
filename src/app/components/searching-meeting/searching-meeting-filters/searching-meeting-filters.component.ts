import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  FilterMeetingsDto,
} from '../../../services/dtos/booking.dto';

import {
  Stage,
} from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-searching-meeting-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './searching-meeting-filters.component.html',
  styleUrl: './searching-meeting-filters.component.scss',
})
export class SearchingMeetingFiltersComponent {

  @Input()
  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    stageId: '',
    assigned: false,
    category: undefined,
    mode: undefined,
  };

  @Input()
  availableHours: number[] = [];

  @Input()
  stages: Stage[] = [];

  @Input()
  ageGroupOptions: string[] = [];

  @Input()
  modeOptions: string[] = [];

  @Output() filterChange = new EventEmitter<void>();

  @Output() clearFilters = new EventEmitter<void>(); 

  onApplyFilters(): void {
    this.filterChange.emit();
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  formatHour(hour: number): string {
    const suffix = hour >= 12
      ? 'PM'
      : 'AM';

    const formattedHour =
      hour % 12 || 12;

    return `${formattedHour}:00 ${suffix}`;
  }

  getStageLabel(stage: Stage): string {
    return stage.number
      ? `Stage ${stage.number}`
      : stage.description || 'Stage';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      KIDS: 'Kids',
      TEENS: 'Teens',
      ADULTS: 'Adults',
    };

    return labels[category] || category;
  }

  getModeLabel(mode: string): string {
    const labels: Record<string, string> = {
      ONLINE: 'Online',
      PRESENCIAL: 'Presencial',
    };

    return labels[mode] || mode;
  }
}