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

  @Input()
  selectedOption:
    EmailRecipientOption | '' = 'user';

  @Input()
  userRole:
    UserRole | null = null;

  @Output()
  optionSelected =
    new EventEmitter<EmailRecipientOption>();

  private readonly allOptions: {
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

  get options(): {
    value: EmailRecipientOption;
    title: string;
    description: string;
  }[] {

    if (
      this.userRole ===
      UserRole.ADMIN
    ) {
      return this.allOptions;
    }

    if (
      this.userRole ===
      UserRole.INSTRUCTOR
    ) {
      return this.allOptions.filter(
        option =>
          option.value === 'user',
      );
    }

    return [];
  }

  selectOption(
    option: EmailRecipientOption,
  ): void {

    const allowed =
      this.options.some(
        item =>
          item.value === option,
      );

    if (!allowed) {
      return;
    }

    if (
      this.selectedOption === option
    ) {
      return;
    }

    this.optionSelected.emit(
      option,
    );
  }

  isSelected(
    option: EmailRecipientOption,
  ): boolean {

    return (
      this.selectedOption === option
    );
  }

  trackByOption(
    index: number,
    option: {
      value: EmailRecipientOption;
    },
  ): EmailRecipientOption {

    return option.value;
  }
}