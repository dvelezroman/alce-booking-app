import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CreateStageDto,
  Stage,
} from '../../../services/dtos/student.dto';


type StageFormMode =
  | 'create'
  | 'edit';


@Component({
  selector: 'app-stages-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './stages-form-modal.component.html',
  styleUrl: './stages-form-modal.component.scss',
})
export class StagesFormModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  mode: StageFormMode = 'create';

  @Input()
  stage: CreateStageDto | Stage = {
    number: '',
    description: '',
  };


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

  showNumberError = false;
  showDescriptionError = false;


  /* =========================
     MODE
  ========================= */

  get isCreateMode(): boolean {
    return this.mode === 'create';
  }


  get isEditMode(): boolean {
    return this.mode === 'edit';
  }


  /* =========================
     HEADER
  ========================= */

  get title(): string {
    return this.isCreateMode
      ? 'Crear nuevo stage'
      : 'Editar stage';
  }


  get description(): string {
    return this.isCreateMode
      ? 'Agrega un nuevo nivel al programa académico.'
      : 'Actualiza la información del stage seleccionado.';
  }


  /* =========================
     BUTTON
  ========================= */

  get saveLabel(): string {
    return this.isCreateMode
      ? 'Crear stage'
      : 'Guardar cambios';
  }


  /* =========================
     VALIDATION
  ========================= */

  get isNumberValid(): boolean {
    return !!this.stage.number
      ?.trim();
  }


  get isDescriptionValid(): boolean {
    return !!this.stage.description
      ?.trim();
  }


  get isValid(): boolean {
    return (
      this.isNumberValid &&
      this.isDescriptionValid
    );
  }


  /* =========================
     NUMBER
  ========================= */

  onNumberInput(): void {
    if (this.showNumberError) {
      this.showNumberError =
        !this.isNumberValid;
    }
  }


  onNumberBlur(): void {
    this.showNumberError =
      !this.isNumberValid;
  }


  /* =========================
     DESCRIPTION
  ========================= */

  onDescriptionInput(): void {
    if (
      this.showDescriptionError
    ) {
      this.showDescriptionError =
        !this.isDescriptionValid;
    }
  }


  onDescriptionBlur(): void {
    this.showDescriptionError =
      !this.isDescriptionValid;
  }


  /* =========================
     SAVE
  ========================= */

  save(): void {
    this.showNumberError =
      !this.isNumberValid;

    this.showDescriptionError =
      !this.isDescriptionValid;

    if (!this.isValid) {
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