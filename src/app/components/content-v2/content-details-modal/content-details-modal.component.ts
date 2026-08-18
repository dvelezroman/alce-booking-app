import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  StudyContentDto,
} from '../../../services/dtos/study-content.dto';


@Component({
  selector: 'app-content-details-modal',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './content-details-modal.component.html',
  styleUrl: './content-details-modal.component.scss',
})
export class ContentDetailsModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  content!: StudyContentDto;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  closeRequested =
    new EventEmitter<void>();


  /* =========================
     ACTIONS
  ========================= */

  close(): void {
    this.closeRequested.emit();
  }


  onBackdropClick(
    event: MouseEvent,
  ): void {
    if (
      event.target ===
      event.currentTarget
    ) {
      this.close();
    }
  }


  /* =========================
     STAGE
  ========================= */

  get stageNumber(): string {
    return (
      this.content?.stage?.number ||
      `Stage ${this.content?.stageId ?? '—'}`
    );
  }


  get stageDescription(): string {
    return (
      this.content?.stage?.description ||
      ''
    );
  }


  /* =========================
     CONTENT
  ========================= */

  get parsedContent(): string {
    const value =
      this.content?.content;

    if (!value) {
      return '—';
    }

    try {
      const parsed =
        JSON.parse(value);

      return typeof parsed === 'string'
        ? parsed || '—'
        : value;
    } catch {
      return value;
    }
  }


  /* =========================
     DATE
  ========================= */

  formatDate(
    value:
      Date |
      string |
      null |
      undefined,
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(date);
  }


  formatTime(
    value:
      Date |
      string |
      null |
      undefined,
  ): string {
    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(date);
  }
}