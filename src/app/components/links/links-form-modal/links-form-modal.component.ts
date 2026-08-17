import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CreateLinkDto,
} from '../../../services/dtos/student.dto';

import {
  MeetingLinkDto,
} from '../../../services/dtos/booking.dto';


type LinkFormMode =
  | 'create'
  | 'edit'
  | 'password';


@Component({
  selector: 'app-links-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './links-form-modal.component.html',
  styleUrl: './links-form-modal.component.scss',
})
export class LinksFormModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  mode: LinkFormMode = 'create';

  @Input({ required: true })
  link!: CreateLinkDto | MeetingLinkDto;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  saveRequested =
    new EventEmitter<void>();

  @Output()
  closeRequested =
    new EventEmitter<void>();


  /* =========================
     STATE
  ========================= */

  showPassword = false;


  /* =========================
     MODE
  ========================= */

  get isCreateMode(): boolean {
    return this.mode === 'create';
  }


  get isEditMode(): boolean {
    return this.mode === 'edit';
  }


  get isPasswordMode(): boolean {
    return this.mode === 'password';
  }


  /* =========================
     CONTENT
  ========================= */

  get title(): string {
    switch (this.mode) {

      case 'edit':
        return 'Editar enlace';

      case 'password':
        return 'Editar contraseña';

      default:
        return 'Nuevo enlace';
    }
  }


  get description(): string {
    switch (this.mode) {

      case 'edit':
        return 'Actualiza la información del enlace seleccionado.';

      case 'password':
        return 'Actualiza la contraseña de acceso del enlace.';

      default:
        return 'Agrega un nuevo enlace de reunión.';
    }
  }


  get saveLabel(): string {
    switch (this.mode) {

      case 'edit':
        return 'Guardar';

      case 'password':
        return 'Actualizar';

      default:
        return 'Crear enlace';
    }
  }


  /* =========================
     VALIDATION
  ========================= */

  get canSave(): boolean {

    /*
     * PASSWORD
     * Solo validamos contraseña.
     */
    if (this.isPasswordMode) {
      return !!(
        this.link?.password?.trim()
      );
    }


    /*
     * CREATE / EDIT
     * Descripción y enlace requeridos.
     */
    return !!(
      this.link?.description?.trim() &&
      this.link?.link?.trim()
    );
  }


  /* =========================
     PASSWORD
  ========================= */

  togglePassword(): void {
    this.showPassword =
      !this.showPassword;
  }


  /* =========================
     SAVE
  ========================= */

  save(): void {
    if (!this.canSave) {
      return;
    }

    this.saveRequested.emit();
  }


  /* =========================
     CLOSE
  ========================= */

  close(): void {
    this.closeRequested.emit();
  }


  /* =========================
     BACKDROP
  ========================= */

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
}