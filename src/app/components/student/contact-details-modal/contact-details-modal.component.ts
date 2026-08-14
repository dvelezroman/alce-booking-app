import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  UserDto,
  UserRole,
} from '../../../services/dtos/user.dto';

type ContactDetailsTab =
  | 'personal'
  | 'academic'
  | 'representative'
  | 'activity'
  | 'notes';

@Component({
  selector: 'app-contact-details-modal',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './contact-details-modal.component.html',
  styleUrls: ['./contact-details-modal.component.scss'],
})
export class ContactDetailsModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() showModal: boolean = false;

  @Input() user: UserDto | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() close = new EventEmitter<void>();


  /* =========================
     TABS
  ========================= */

  activeTab: ContactDetailsTab = 'personal';

  setActiveTab(tab: ContactDetailsTab): void {
    this.activeTab = tab;
  }


  /* =========================
     MODAL
  ========================= */

  handleClose(): void {
    this.activeTab = 'personal';
    this.close.emit();
  }


  /* =========================
     USER
  ========================= */

  getUserFullName(): string {
    if (!this.user) {
      return 'Usuario';
    }

    const fullName = [
      this.user.firstName,
      this.user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || 'Usuario';
  }

  getUserInitials(): string {
    if (!this.user) {
      return 'U';
    }

    const firstName =
      this.user.firstName?.trim().charAt(0) || '';

    const lastName =
      this.user.lastName?.trim().charAt(0) || '';

    return `${firstName}${lastName}`.toUpperCase() || 'U';
  }


  /* =========================
     ROLE
  ========================= */

  isStudent(): boolean {
    return this.user?.role === UserRole.STUDENT;
  }

  isInstructor(): boolean {
    return this.user?.role === UserRole.INSTRUCTOR;
  }

  isAdmin(): boolean {
    return this.user?.role === UserRole.ADMIN;
  }

  getRoleLabel(): string {
    switch (this.user?.role) {
      case UserRole.STUDENT:
        return 'Estudiante';

      case UserRole.INSTRUCTOR:
        return 'Instructor';

      case UserRole.ADMIN:
        return 'Administrador';

      default:
        return 'Usuario';
    }
  }


  /* =========================
     REPRESENTATIVE
  ========================= */

  get hasRepresentativeData(): boolean {
    return !!(
      this.user?.student?.tutorName ||
      this.user?.student?.tutorEmail ||
      this.user?.student?.tutorPhone
    );
  }


  /* =========================
     SUSPENSION
  ========================= */

  get hasActiveSuspension(): boolean {
    if (!this.isStudent()) {
      return false;
    }

    return !!(
      this.user?.student?.suspensionDays &&
      this.user?.student?.suspensionStartDate &&
      this.user?.student?.suspensionEndDate
    );
  }


  /* =========================
     ENUMS
  ========================= */

  protected readonly UserRole = UserRole;
}