import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  Stage,
} from '../../../services/dtos/student.dto';

export type SearchingUserFormType =
  | 'student'
  | 'user'
  | 'code';

@Component({
  selector: 'app-searching-user-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './searching-user-filters.component.html',
  styleUrl: './searching-user-filters.component.scss',
})
export class SearchingUserFiltersComponent {

  /* =========================
     INPUTS
  ========================== */

  @Input()
  currentForm: SearchingUserFormType = 'student';

  @Input()
  studentForm!: FormGroup;

  @Input()
  userForm!: FormGroup;

  @Input()
  codeForm!: FormGroup;

  @Input()
  stages: Stage[] = [];

  @Input()
  roles: string[] = [];


  /* =========================
     OUTPUTS
  ========================== */

  @Output()
  searchRequested = new EventEmitter<void>();

  @Output()
  codeSearchRequested = new EventEmitter<void>();


  /* =========================
     SEARCH
  ========================== */

  onSearch(): void {
    if (this.currentForm === 'code') {
      this.codeSearchRequested.emit();
      return;
    }

    this.searchRequested.emit();
  }


  /* =========================
     CLEAR FILTERS
  ========================== */

  clearFilters(): void {
    if (this.currentForm === 'student') {
      this.studentForm.reset({
        userId: '',
        firstName: '',
        lastName: '',
        stageId: '',
      });

      return;
    }

    if (this.currentForm === 'user') {
      this.userForm.reset({
        email: '',
        role: '',
      });

      return;
    }

    this.codeForm.reset({
      idNumber: '',
    });
  }


  /* =========================
     LABEL
  ========================== */

  get filterLabel(): string {
    switch (this.currentForm) {
      case 'student':
        return 'Estudiante';

      case 'user':
        return 'Usuario';

      case 'code':
        return 'Código';

      default:
        return '';
    }
  }

}