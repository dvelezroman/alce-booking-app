import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './profile-overview.component.html',
  styleUrl:
    './profile-overview.component.scss',
})
export class ProfileOverviewComponent {
  @Input() user: UserDto | null = null;

  get isStudent(): boolean {
    return (
      this.user?.role
        ?.toString()
        .trim()
        .toUpperCase() === 'STUDENT'
    );
  }

  get roleLabel(): string {
    const role = this.user?.role
      ?.toString()
      .trim()
      .toUpperCase();

    switch (role) {
      case 'STUDENT':
        return 'STUDENT';

      case 'INSTRUCTOR':
        return 'INSTRUCTOR';

      case 'ADMIN':
        return 'ADMIN';

      case 'OPERATOR':
        return 'OPERATOR';

      default:
        return 'No registrado';
    }
  }

  get studyModeLabel(): string {
    if (!this.isStudent) {
      return 'Solo estudiantes';
    }

    const mode = this.user?.student?.mode
      ?.toString()
      .trim()
      .toUpperCase();

    switch (mode) {
      case 'ONLINE':
        return 'ONLINE';

      case 'PRESENTIAL':
        return 'PRESENCIAL';

      case 'HYBRID':
        return 'HÍBRIDO';

      default:
        return 'No registrado';
    }
  }

  get stageNumber(): string {
    if (!this.isStudent) {
      return 'No aplica';
    }

    return (
      this.user?.stage?.number?.trim() ||
      this.user?.student?.stage?.number?.trim() ||
      'Sin etapa'
    );
  }

  get stageDescription(): string {
    if (!this.isStudent) {
      return 'Disponible solo para estudiantes';
    }

    return (
      this.user?.stage?.description?.trim() ||
      this.user?.student?.stage?.description?.trim() ||
      'Etapa no registrada'
    );
  }

  get classificationLabel(): string {
    if (!this.isStudent) {
      return 'Solo estudiantes';
    }

    const classification =
      this.user?.student
        ?.studentClassification
        ?.toString()
        .trim()
        .toUpperCase();

    switch (classification) {
      case 'ADULTS':
        return 'ADULTS';

      case 'KIDS':
        return 'KIDS';

      case 'TEENS':
        return 'TEENS';

      case 'CHILDREN':
        return 'CHILDREN';

      default:
        return 'No registrado';
    }
  }
}