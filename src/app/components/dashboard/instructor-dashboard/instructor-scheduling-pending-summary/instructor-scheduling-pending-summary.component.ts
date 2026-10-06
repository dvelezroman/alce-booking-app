import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { LeadSchedulingPendingCountService } from '../../../../services/lead-scheduling-pending-count.service';
import { UserRole } from '../../../../services/dtos/user.dto';

@Component({
  selector: 'app-instructor-scheduling-pending-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './instructor-scheduling-pending-summary.component.html',
  styleUrl: './instructor-scheduling-pending-summary.component.scss',
})
export class InstructorSchedulingPendingSummaryComponent
  implements OnInit, OnDestroy
{
  pendingAssignmentCount = 0;
  scheduledReportPendingCount = 0;

  private readonly subs = new Subscription();

  constructor(
    private readonly leadSchedulingPending: LeadSchedulingPendingCountService,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.leadSchedulingPending.instructorPendingAssignmentCount$.subscribe(
        (count) => (this.pendingAssignmentCount = count),
      ),
    );
    this.subs.add(
      this.leadSchedulingPending.instructorScheduledReportPendingCount$.subscribe(
        (count) => (this.scheduledReportPendingCount = count),
      ),
    );
    this.leadSchedulingPending.refresh(UserRole.INSTRUCTOR).subscribe();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get hasPendingWork(): boolean {
    return (
      this.pendingAssignmentCount > 0 ||
      this.scheduledReportPendingCount > 0
    );
  }
}
