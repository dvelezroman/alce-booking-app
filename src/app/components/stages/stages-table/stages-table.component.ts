import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Stage,
} from '../../../services/dtos/student.dto';


@Component({
  selector: 'app-stages-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stages-table.component.html',
  styleUrl: './stages-table.component.scss',
})
export class StagesTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  stages: Stage[] = [];

  @Input()
  startIndex = 0;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  editRequested =
    new EventEmitter<Stage>();

  @Output()
  deleteRequested =
    new EventEmitter<Stage>();


  /* =========================
     MENU
  ========================= */

  openedMenuId: number | null = null;

  menuPosition = {
    top: 0,
    left: 0,
  };


  toggleMenu(
    stage: Stage,
    event: MouseEvent,
  ): void {

    event.stopPropagation();

    if (
      this.openedMenuId ===
      stage.id
    ) {
      this.closeMenu();
      return;
    }

    const trigger =
      event.currentTarget as HTMLElement;

    const rect =
      trigger.getBoundingClientRect();

    const menuWidth = 190;
    const menuHeight = 125;
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

    if (
      left <
      margin
    ) {
      left = margin;
    }

    if (
      left +
      menuWidth >
      viewportWidth -
      margin
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
      stage.id;
  }


  isMenuOpen(
    stage: Stage,
  ): boolean {

    return (
      this.openedMenuId ===
      stage.id
    );
  }


  closeMenu(): void {
    this.openedMenuId = null;
  }


  /* =========================
     GLOBAL CLOSE
  ========================= */

  @HostListener(
    'document:click'
  )
  onDocumentClick(): void {
    this.closeMenu();
  }


  @HostListener(
    'window:resize'
  )
  onWindowResize(): void {
    this.closeMenu();
  }


  @HostListener(
    'window:scroll'
  )
  onWindowScroll(): void {
    this.closeMenu();
  }


  /* =========================
     ACTIONS
  ========================= */

  edit(
    stage: Stage,
    event: MouseEvent,
  ): void {

    event.stopPropagation();

    this.closeMenu();

    this.editRequested.emit(
      stage,
    );
  }


  delete(
    stage: Stage,
    event: MouseEvent,
  ): void {

    event.stopPropagation();

    this.closeMenu();

    this.deleteRequested.emit(
      stage,
    );
  }


  /* =========================
     HELPERS
  ========================= */

  getRowNumber(
    index: number,
  ): number {

    return (
      this.startIndex +
      index
    );
  }


  getStageNumber(
    stage: Stage,
  ): string {

    return (
      stage.number ||
      '—'
    );
  }


  getDescription(
    stage: Stage,
  ): string {

    return (
      stage.description ||
      'Sin descripción'
    );
  }


  /* =========================
     TRACK
  ========================= */

  trackByStageId(
    index: number,
    stage: Stage,
  ): number {

    return stage.id;
  }
}