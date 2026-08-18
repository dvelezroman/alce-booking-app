import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  StudyContentDto,
} from '../../../services/dtos/study-content.dto';


@Component({
  selector: 'app-content-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './content-table.component.html',
  styleUrl: './content-table.component.scss',
})
export class ContentTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  contents: StudyContentDto[] = [];

  @Input()
  startIndex = 0;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  detailsRequested =
    new EventEmitter<StudyContentDto>();

  @Output()
  editRequested =
    new EventEmitter<StudyContentDto>();

  @Output()
  deleteRequested =
    new EventEmitter<StudyContentDto>();


  /* =========================
     MENU
  ========================= */

  openedMenuId: number | null = null;

  menuPosition = {
    top: 0,
    left: 0,
  };


  toggleMenu(
    content: StudyContentDto,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    if (
      this.openedMenuId ===
      content.id
    ) {
      this.closeMenu();
      return;
    }

    const trigger =
      event.currentTarget as HTMLElement;

    const rect =
      trigger.getBoundingClientRect();

    const menuWidth = 190;
    const menuHeight = 155;
    const gap = 8;
    const margin = 12;

    const viewportWidth =
      window.innerWidth;

    const viewportHeight =
      window.innerHeight;


    /* =========================
       HORIZONTAL
    ========================= */

    let left =
      rect.right -
      menuWidth;

    if (left < margin) {
      left = margin;
    }

    if (
      left + menuWidth >
      viewportWidth - margin
    ) {
      left =
        viewportWidth -
        menuWidth -
        margin;
    }


    /* =========================
       VERTICAL
    ========================= */

    const spaceBelow =
      viewportHeight -
      rect.bottom;

    const spaceAbove =
      rect.top;

    let top: number;

    if (
      spaceBelow >=
      menuHeight + gap
    ) {
      top =
        rect.bottom +
        gap;
    } else if (
      spaceAbove >=
      menuHeight + gap
    ) {
      top =
        rect.top -
        menuHeight -
        gap;
    } else {
      top =
        Math.max(
          margin,
          Math.min(
            rect.bottom + gap,
            viewportHeight -
            menuHeight -
            margin,
          ),
        );
    }

    this.menuPosition = {
      top,
      left,
    };

    this.openedMenuId =
      content.id;
  }


  isMenuOpen(
    content: StudyContentDto,
  ): boolean {
    return (
      this.openedMenuId ===
      content.id
    );
  }


  closeMenu(): void {
    this.openedMenuId = null;
  }


  /* =========================
     GLOBAL CLOSE
  ========================= */

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenu();
  }


  @HostListener('window:resize')
  onWindowResize(): void {
    this.closeMenu();
  }


  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.closeMenu();
  }


  /* =========================
     ACTIONS
  ========================= */

  viewDetails(
    content: StudyContentDto,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    this.detailsRequested.emit(
      content,
    );
  }


  edit(
    content: StudyContentDto,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    this.editRequested.emit(
      content,
    );
  }


  delete(
    content: StudyContentDto,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    this.deleteRequested.emit(
      content,
    );
  }


  /* =========================
     ROW
  ========================= */

  getRowNumber(
    index: number,
  ): number {
    return (
      this.startIndex +
      index
    );
  }


  /* =========================
     STAGE
  ========================= */

  getStageLabel(
    content: StudyContentDto,
  ): string {
    return (
      content.stage?.number ||
      `Stage ${content.stageId}`
    );
  }


  /* =========================
     CONTENT
  ========================= */

  parseContent(
    content:
      string |
      null |
      undefined,
  ): string {
    if (!content) {
      return '—';
    }

    try {
      const parsed =
        JSON.parse(content);

      return typeof parsed === 'string'
        ? parsed || '—'
        : content;
    } catch {
      return content;
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