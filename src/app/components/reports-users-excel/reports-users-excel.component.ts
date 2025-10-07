import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Stage } from '../../services/dtos/student.dto';
import { UsersExcelFilterDto, AbsentStudentsExcelFilterDto } from '../../services/dtos/reports.dto';
import { UserRole, UserStatus } from '../../services/dtos/user.dto';

@Component({
  selector: 'app-reports-users-excel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports-users-excel.component.html',
  styleUrl: './reports-users-excel.component.scss'
})
export class ReportsUsersExcelComponent {
  @Input() stages: Stage[] = [];
  @Input() mode: 'users' | 'absents' = 'users';

  @Output() downloadExcel = new EventEmitter<UsersExcelFilterDto>();
  @Output() downloadAbsentExcel = new EventEmitter<AbsentStudentsExcelFilterDto>();

  form: FormGroup;
  absentForm: FormGroup;
  userRoles = Object.values(UserRole);
  userStatuses = Object.values(UserStatus);

  constructor(private fb: FormBuilder) {
    // Formulario de usuarios
    this.form = this.fb.group({
      role: ['', Validators.required],
      status: [''],
      stageId: [''],
      noClasses: [false]
    });

    // Formulario de inasistencias
    this.absentForm = this.fb.group(
      {
        from: [''],
        to: [''],
        stageId: ['']
      },
      { validators: this.fromRequiredIfNoTo }
    );

    // Ocultar stage cuando el rol no sea STUDENT
    this.form.get('role')?.valueChanges.subscribe((role) => {
      if (role !== UserRole.STUDENT) {
        this.form.patchValue({ stageId: '' }, { emitEvent: false });
      }
    });
  }

  /** Valida que si no se coloca "to", "from" sea requerido */
  private fromRequiredIfNoTo(control: AbstractControl) {
    const from = control.get('from')?.value;
    const to = control.get('to')?.value;

    if (!to && !from) {
      control.get('from')?.setErrors({ requiredIfNoTo: true });
      return { requiredIfNoTo: true };
    } else {
      if (control.get('from')?.hasError('requiredIfNoTo')) {
        control.get('from')?.setErrors(null);
      }
      return null;
    }
  }

  /** Convierte la fecha a formato YYYY-MM-DD si existe */
  private formatDate(value: any): string | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.mode === 'users') {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }

      const filters: UsersExcelFilterDto = {
        role: this.form.value.role,
        status: this.form.value.status || undefined,
        stageId: this.form.value.stageId ? Number(this.form.value.stageId) : undefined,
        noClasses: this.form.value.noClasses ?? false
      };

      this.downloadExcel.emit(filters);
    } else {
      if (this.absentForm.invalid) {
        this.absentForm.markAllAsTouched();
        return;
      }

      const filters: AbsentStudentsExcelFilterDto = {
        from: this.formatDate(this.absentForm.value.from) || '',
        to: this.formatDate(this.absentForm.value.to) || '',
        stageId: this.absentForm.value.stageId ? Number(this.absentForm.value.stageId) : undefined
      };

      this.downloadAbsentExcel.emit(filters);
    }
  }

  resetFilters(): void {
    if (this.mode === 'users') {
      this.form.reset();
    } else {
      this.absentForm.reset();
    }
  }

  /** Retorna true si debe mostrarse el campo stage */
  showStage(): boolean {
    return this.form.value.role === UserRole.STUDENT || !this.form.value.role;
  }
}