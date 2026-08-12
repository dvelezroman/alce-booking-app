import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
  LeadSchedulingRequestRow,
  LeadSchedulingRequestStatus,
} from '../../../services/dtos/lead-scheduling-request.dto';

import { InstructorSchedulingRequestRowComponent } from '../instructor-scheduling-request-row/instructor-scheduling-request-row.component';

@Component({
  selector: 'app-instructor-scheduling-request-list',
  standalone: true,
  imports: [
    CommonModule,
    InstructorSchedulingRequestRowComponent,
  ],
  templateUrl: './instructor-scheduling-request-list.component.html',
  styleUrl: './instructor-scheduling-request-list.component.scss',
})
export class InstructorSchedulingRequestListComponent {
  @Input() items: LeadSchedulingRequestRow[] = [];
  @Input() loading: boolean = false;

  @Input() kindText!: (row: LeadSchedulingRequestRow) => string;

  @Input() statusText!: (
    status: LeadSchedulingRequestStatus,
  ) => string;

  @Input() slotText!: (
    row: LeadSchedulingRequestRow,
  ) => string;

  @Input() notesPreview!: (
    row: LeadSchedulingRequestRow,
  ) => string | null;

  get hasItems(): boolean {
    return this.items.length > 0;
  }

  get itemsCount(): number {
    return this.items.length;
  }

  trackByRequestId(
    index: number,
    item: LeadSchedulingRequestRow,
  ): number {
    return item.id;
  }
}