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

  @Input() selectedCount = 0;

  @Output()
  selectedInstructorChange =
    new EventEmitter<Instructor | null>();

  @Output()
  assignRequested =
    new EventEmitter<void>();


  /* =========================
     INSTRUCTOR SEARCH
  ========================= */

  instructorSearch: string = '';

  showInstructorDropdown: boolean = false;

  filteredInstructors: Instructor[] = [];


  /* =========================
     STATES
  ========================= */

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


  /* =========================
     INSTRUCTOR SEARCH
  ========================= */

  onInstructorInputFocus(): void {
    this.filteredInstructors = [
      ...this.instructors,
    ];

    this.showInstructorDropdown = true;
  }

  onInstructorInputChange(
    value: string,
  ): void {
    this.instructorSearch = value;

    const term =
      value
        .trim()
        .toLowerCase();

    /*
     * Si ya había un instructor seleccionado
     * y el usuario vuelve a escribir,
     * quitamos esa selección.
     */
    if (this.selectedInstructor) {
      this.selectedInstructor = null;

      this.selectedInstructorChange.emit(
        null,
      );
    }

    this.showInstructorDropdown = true;

    if (!term) {
      this.filteredInstructors = [
        ...this.instructors,
      ];

      return;
    }

    this.filteredInstructors =
      this.instructors.filter(
        instructor => {
          const name =
            this
              .getInstructorName(
                instructor,
              )
              .toLowerCase();

          const email =
            this
              .getInstructorSubtitle(
                instructor,
              )
              .toLowerCase();

          return (
            name.includes(term) ||
            email.includes(term)
          );
        },
      );
  }

  onInstructorInputBlur(): void {
    setTimeout(() => {
      this.showInstructorDropdown =
        false;
    }, 150);
  }

  onSelectInstructor(
    instructor: Instructor,
  ): void {
    this.selectedInstructor =
      instructor;

    this.instructorSearch =
      this.getInstructorName(
        instructor,
      );

    this.selectedInstructorChange.emit(
      instructor,
    );

    this.showInstructorDropdown =
      false;
  }

  clearInstructor(): void {
    this.selectedInstructor = null;

    this.instructorSearch = '';

    this.filteredInstructors = [
      ...this.instructors,
    ];

    this.showInstructorDropdown =
      false;

    this.selectedInstructorChange.emit(
      null,
    );
  }


  /* =========================
     ASSIGN
  ========================= */

  onAssignRequested(): void {
    if (!this.canAssign) {
      return;
    }

    this.assignRequested.emit();
  }


  /* =========================
     INSTRUCTOR HELPERS
  ========================= */

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
    return (
      instructor.user?.email ||
      'Instructor'
    );
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