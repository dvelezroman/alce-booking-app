import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  UserRole,
} from '../../../services/dtos/user.dto';

export type EmailRecipientOption =
  | 'user'
  | 'stage'
  | 'group'
  | 'role';

@Component({
  selector: 'app-email-recipient-selector',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './email-recipient-selector.component.html',
  styleUrl:
    './email-recipient-selector.component.scss',
})
export class EmailRecipientSelectorComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  selectedOption:
    EmailRecipientOption | '' = 'user';

  @Input()
  userRole: UserRole | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  optionSelected =
    new EventEmitter<EmailRecipientOption>();


  /* =========================
     OPTIONS
  ========================= */

  readonly options: {
    value: EmailRecipientOption;
    title: string;
    description: string;
  }[] = [
    {
      value: 'user',
      title: 'Usuario individual',
      description:
        'Envía un email a un usuario específico.',
    },
    {
      value: 'stage',
      title: 'Por etapa (Stage)',
      description:
        'Envía a todos los usuarios de una etapa académica.',
    },
    {
      value: 'group',
      title: 'Por grupo',
      description:
        'Envía a todos los integrantes de un grupo.',
    },
    {
      value: 'role',
      title: 'Por rol',
      description:
        'Envía a todos los usuarios según su rol.',
    },
  ];


  /* =========================
     SELECT
  ========================= */

  selectOption(
    option: EmailRecipientOption,
  ): void {
    if (
      this.selectedOption === option
    ) {
      return;
    }

    this.optionSelected.emit(
      option,
    );
  }


  /* =========================
     ACTIVE
  ========================= */

  isSelected(
    option: EmailRecipientOption,
  ): boolean {
    return (
      this.selectedOption === option
    );
  }


  /* =========================
     TRACK
  ========================= */

  trackByOption(
    index: number,
    option: {
      value: EmailRecipientOption;
    },
  ): EmailRecipientOption {
    return option.value;
  }
}