import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FormsModule,
} from '@angular/forms';


export type ActionType =
  | 'action'
  | 'close'
  | 'whatsapp';


export interface ActionButton {
  id: string;
  type: ActionType;
  label: string;
  url?: string;
  color?: string;
  delaySeconds?: number;
}


@Component({
  selector: 'app-announcement-v2-actions',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
  ],

  templateUrl:
    './announcement-v2-actions.component.html',

  styleUrl:
    './announcement-v2-actions.component.scss',
})
export class AnnouncementV2ActionsComponent {

  /* =========================================================
     INPUTS
  ========================================================= */

  @Input()
  actions:
    ActionButton[] = [];


  /* =========================================================
     OUTPUTS
  ========================================================= */

  @Output()
  add =
    new EventEmitter<ActionType>();

  @Output()
  update =
    new EventEmitter<{
      id: string;
      updates: Partial<ActionButton>;
    }>();

  @Output()
  remove =
    new EventEmitter<string>();

  @Output()
  error =
    new EventEmitter<string>();


  /* =========================================================
     CONFIG
  ========================================================= */

  readonly maxActions =
    3;


  readonly delayOptions:
    number[] = [
      10,
      15,
      20,
      30,
      40,
      50,
      60,
    ];


  readonly colorOptions = [
    {
      label: 'Azul',
      value: '#28336f',
    },
    {
      label: 'Gris',
      value: '#6b7280',
    },
    {
      label: 'Dorado',
      value: '#d4af37',
    },
  ];


  /* =========================================================
     GETTERS
  ========================================================= */

  get canAddAction(): boolean {

    return (
      this.actions.length <
      this.maxActions
    );
  }


  get nextAvailableType():
    ActionType | null {

    const types:
      ActionType[] = [
        'action',
        'whatsapp',
        'close',
      ];


    for (
      const type of types
    ) {

      const exists =
        this.actions.some(
          action =>
            action.type === type,
        );


      if (
        !exists
      ) {
        return type;
      }
    }


    return null;
  }


  /* =========================================================
     ADD
  ========================================================= */

  onAdd(): void {

    if (
      this.actions.length >=
      this.maxActions
    ) {

      this.error.emit(
        'Máximo 3 botones',
      );

      return;
    }


    const type =
      this.nextAvailableType;


    if (
      !type
    ) {

      this.error.emit(
        'Ya agregaste todos los tipos de botón disponibles',
      );

      return;
    }


    this.add.emit(
      type,
    );
  }


  /* =========================================================
     TYPE
  ========================================================= */

  onTypeChange(
    action: ActionButton,
    value: string,
  ): void {

    const type =
      value as ActionType;


    if (
      this.isTypeAlreadyUsed(
        type,
        action.id,
      )
    ) {

      this.error.emit(
        `Ya existe un botón de tipo "${this.getTypeLabel(type)}"`,
      );

      return;
    }


    const updates:
      Partial<ActionButton> = {
        type,
      };


    if (
      type === 'whatsapp'
    ) {

      updates.label =
        'WhatsApp';

      updates.color =
        '#25D366';
    }


    if (
      type === 'close'
    ) {

      updates.label =
        'Cerrar';

      updates.url =
        undefined;

      updates.color =
        undefined;
    }


    if (
      type === 'action'
    ) {

      updates.label =
        '';

      updates.color =
        '#28336f';

      updates.url =
        '';
    }


    this.update.emit({
      id:
        action.id,

      updates,
    });
  }


  /* =========================================================
     LABEL
  ========================================================= */

  onLabelChange(
    id: string,
    value: string,
  ): void {

    this.update.emit({
      id,

      updates: {
        label:
          value,
      },
    });
  }


  /* =========================================================
     URL
  ========================================================= */

  onUrlChange(
    id: string,
    value: string,
  ): void {

    this.update.emit({
      id,

      updates: {
        url:
          value,
      },
    });
  }


  /* =========================================================
     COLOR
  ========================================================= */

  onColorChange(
    id: string,
    value: string,
  ): void {

    this.update.emit({
      id,

      updates: {
        color:
          value,
      },
    });
  }


  /* =========================================================
     DELAY
  ========================================================= */

  onDelayChange(
    id: string,
    value: string,
  ): void {

    const delay =
      Number(value);


    this.update.emit({
      id,

      updates: {
        delaySeconds:
          Number.isNaN(delay)
            ? 0
            : Math.max(
                0,
                delay,
              ),
      },
    });
  }


  /* =========================================================
     REMOVE
  ========================================================= */

  onRemove(
    id: string,
  ): void {

    this.remove.emit(
      id,
    );
  }


  /* =========================================================
     HELPERS
  ========================================================= */

  isTypeAlreadyUsed(
    type: ActionType,
    currentId: string,
  ): boolean {

    return (
      this.actions.some(
        action =>
          action.type === type &&
          action.id !== currentId,
      )
    );
  }


  getTypeLabel(
    type: ActionType,
  ): string {

    switch (
      type
    ) {

      case 'action':
        return 'Acción';

      case 'whatsapp':
        return 'WhatsApp';

      case 'close':
        return 'Cerrar';

      default:
        return type;
    }
  }


  getActionDescription(
    action: ActionButton,
  ): string {

    switch (
      action.type
    ) {

      case 'action':
        return 'Acción';

      case 'whatsapp':
        return 'WhatsApp';

      case 'close':
        return 'Cerrar';

      default:
        return '';
    }
  }


  getActionIconClass(
    type: ActionType,
  ): string {

    return (
      `announcement-v2-actions__action-icon--${type}`
    );
  }


  getCurrentColor(
    action: ActionButton,
  ): string {

    if (
      action.type ===
      'whatsapp'
    ) {
      return '#25D366';
    }


    return (
      action.color ||
      '#28336f'
    );
  }


  trackById(
    index: number,
    action: ActionButton,
  ): string {

    return action.id;
  }

}