import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Instructor,
} from '../../../services/dtos/instructor.dto';

@Component({
  selector: 'app-searching-meeting-assignment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './searching-meeting-assignment-form.component.html',
  styleUrl: './searching-meeting-assignment-form.component.scss',
})
export class SearchingMeetingAssignmentFormComponent {

  @Input()
  instructors: Instructor[] = [];

  @Input()
  selectedInstructor:
    | Instructor
    | null
    | undefined = null;

  @Input()
  selectedCount = 0;

  @Output()
  selectedInstructorChange =
    new EventEmitter<Instructor | null>();

  @Output()
  assignRequested =
    new EventEmitter<void>();

  get hasSelection(): boolean {
    return this.selectedCount > 0;
  }

  get hasSelectedInstructor(): boolean {
    return !!this.selectedInstructor;
  }

  get meetingLink(): string {
    return (
      this.selectedInstructor
        ?.meetingLink
        ?.link || ''
    );
  }

  get meetingPassword(): string {
    return (
      this.selectedInstructor
        ?.meetingLink
        ?.password || ''
    );
  }

  get canAssign(): boolean {
    return (
      this.hasSelection &&
      this.hasSelectedInstructor &&
      !!this.meetingLink.trim()
    );
  }

  onInstructorChange(
    instructorId: string,
  ): void {
    if (!instructorId) {
      this.selectedInstructor = null;

      this.selectedInstructorChange.emit(
        null,
      );

      return;
    }

    const instructor =
      this.instructors.find(
        item =>
          String(item.id) ===
          instructorId,
      ) || null;

    this.selectedInstructor =
      instructor;

    this.selectedInstructorChange.emit(
      instructor,
    );
  }

  onAssignRequested(): void {
    if (!this.canAssign) {
      return;
    }

    this.assignRequested.emit();
  }

  getInstructorName(
    instructor: Instructor,
  ): string {
    const firstName =
      instructor.user
        ?.firstName
        ?.trim() || '';

    const lastName =
      instructor.user
        ?.lastName
        ?.trim() || '';

    return (
      `${firstName} ${lastName}`.trim() ||
      `Instructor #${instructor.id}`
    );
  }

  getInstructorInitials(
    instructor: Instructor,
  ): string {
    const firstName =
      instructor.user
        ?.firstName
        ?.trim() || '';

    const lastName =
      instructor.user
        ?.lastName
        ?.trim() || '';

    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return (
      initials ||
      'IN'
    ).toUpperCase();
  }

  getInstructorSubtitle(
    instructor: Instructor,
  ): string {
    return instructor.user?.email || '';
  }

  trackByInstructorId(
    index: number,
    instructor: Instructor,
  ): number {
    return (
      instructor.id ??
      index
    );
  }
}