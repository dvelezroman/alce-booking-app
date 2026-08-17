import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MeetingLinkDto,
} from '../../../services/dtos/booking.dto';


@Component({
  selector: 'app-links-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './links-table.component.html',
  styleUrl: './links-table.component.scss',
})
export class LinksTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  links: MeetingLinkDto[] = [];


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  editRequested =
    new EventEmitter<MeetingLinkDto>();

  @Output()
  editPasswordRequested =
    new EventEmitter<MeetingLinkDto>();

  @Output()
  deleteRequested =
    new EventEmitter<MeetingLinkDto>();


  /* =========================
     MENU
  ========================= */

  openedMenuId: number | null = null;

  menuPosition = {
    top: 0,
    left: 0,
  };


  toggleMenu(
    link: MeetingLinkDto,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    if (
      this.openedMenuId === link.id
    ) {
      this.closeMenu();
      return;
    }

    const trigger =
      event.currentTarget as HTMLElement;

    const rect =
      trigger.getBoundingClientRect();

    const menuWidth = 230;
    const menuHeight = 190;
    const gap = 8;
    const viewportMargin = 12;

    const spaceBelow =
      window.innerHeight -
      rect.bottom;

    const spaceAbove =
      rect.top;

    let top: number;

    /*
     * Abajo si existe espacio.
     * Arriba si abajo no cabe.
     */
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
      /*
       * Si no cabe completo ni arriba
       * ni abajo, lo mantenemos dentro
       * del viewport.
       */
      top = Math.max(
        viewportMargin,
        Math.min(
          rect.bottom + gap,
          window.innerHeight -
            menuHeight -
            viewportMargin,
        ),
      );
    }


    /* =========================
       HORIZONTAL POSITION
    ========================= */

    let left =
      rect.right -
      menuWidth;

    if (
      left <
      viewportMargin
    ) {
      left =
        viewportMargin;
    }

    if (
      left +
        menuWidth >
      window.innerWidth -
        viewportMargin
    ) {
      left =
        window.innerWidth -
        menuWidth -
        viewportMargin;
    }


    this.menuPosition = {
      top,
      left,
    };

    this.openedMenuId =
      link.id;
  }


  isMenuOpen(
    id: number,
  ): boolean {
    return (
      this.openedMenuId === id
    );
  }


  closeMenu(): void {
    this.openedMenuId = null;
  }


  /* =========================
     ACTIONS
  ========================= */

  onEdit(
    link: MeetingLinkDto,
  ): void {
    this.closeMenu();

    this.editRequested.emit(
      link,
    );
  }


  onEditPassword(
    link: MeetingLinkDto,
  ): void {
    this.closeMenu();

    this.editPasswordRequested.emit(
      link,
    );
  }


  onDelete(
    link: MeetingLinkDto,
  ): void {
    this.closeMenu();

    this.deleteRequested.emit(
      link,
    );
  }


  /* =========================
     LINK
  ========================= */

  openLink(
    link: string | null | undefined,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    const value =
      link?.trim();

    if (!value) {
      return;
    }

    window.open(
      value,
      '_blank',
      'noopener,noreferrer',
    );
  }


  /* =========================
     PASSWORD
  ========================= */

  hasPassword(
    link: MeetingLinkDto,
  ): boolean {
    return !!link.password?.trim();
  }


  getPasswordDots(
    link: MeetingLinkDto,
  ): string {
    return this.hasPassword(link)
      ? '••••••'
      : '—';
  }
}