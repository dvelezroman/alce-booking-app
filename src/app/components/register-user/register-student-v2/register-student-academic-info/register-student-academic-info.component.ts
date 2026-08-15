import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  Mode,
  Stage,
  StudentClassification,
} from '../../../../services/dtos/student.dto';

@Component({
  selector: 'app-register-student-academic-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-student-academic-info.component.html',
  styleUrl: './register-student-academic-info.component.scss',
})
export class RegisterStudentAcademicInfoComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  registerForm!: FormGroup;

  @Input()
  stages: Stage[] = [];

  @Input()
  modes: Mode[] = [];

  @Input()
  studentClassifications: StudentClassification[] = [];


  /* =========================
     FORM HELPERS
  ========================= */

  isInvalid(
    controlName: string,
  ): boolean {
    const control =
      this.registerForm?.get(
        controlName,
      );

    return !!(
      control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }


  /* =========================
     STAGE
  ========================= */

  getStageLabel(
    stage: Stage,
  ): string {
    return (
      stage.description ||
      stage.number ||
      `Stage ${stage.id}`
    );
  }


  /* =========================
     CLASSIFICATION
  ========================= */

  getClassificationLabel(
    classification: StudentClassification,
  ): string {
    switch (
      classification
    ) {
      case StudentClassification.KIDS:
        return 'Niños';

      case StudentClassification.TEENS:
        return 'Adolescentes';

      case StudentClassification.ADULTS:
        return 'Adultos';

      default:
        return String(
          classification,
        );
    }
  }


  /* =========================
     MODE
  ========================= */

  getModeLabel(
    mode: Mode,
  ): string {
    switch (
      mode
    ) {
      case Mode.ONLINE:
        return 'Online';

      case Mode.PRESENCIAL:
        return 'Presencial';

      default:
        return String(mode);
    }
  }


  /* =========================
     REQUIRED
  ========================= */

  isRequired(
    controlName: string,
  ): boolean {
    const control =
      this.registerForm?.get(
        controlName,
      );

    if (!control?.validator) {
      return false;
    }

    const validator =
      control.validator({
        ...control,
        value: null,
      } as any);

    return !!validator?.[
      'required'
    ];
  }
}