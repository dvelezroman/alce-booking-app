import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Stage } from '../../services/dtos/student.dto';
import { UsersExcelFilterDto, AbsentStudentsExcelFilterDto } from '../../services/dtos/reports.dto';
import { UserRole, UserStatus } from '../../services/dtos/user.dto';
import { Instructor } from '../../services/dtos/instructor.dto';

@Component({
  selector: 'app-reports-users-excel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports-users-excel.component.html',
  styleUrl: './reports-users-excel.component.scss'
})
export class ReportsUsersExcelComponent {
  @Input() stages: Stage[] = [];
  @Input() instructors: Instructor[] = [];
  @Input() mode: 'users' | 'absents' = 'users';

  @Output() downloadExcel = new EventEmitter<UsersExcelFilterDto>();
  @Output() downloadAbsentExcel = new EventEmitter<AbsentStudentsExcelFilterDto>();

  form: FormGroup;
  absentForm: FormGroup;
  userRoles = Object.values(UserRole);
  userStatuses = Object.values(UserStatus);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      role: [''],
      status: [''],
      stageId: [''],
      noClasses: [false]
    });

    this.absentForm = this.fb.group({
      instructorId: [''],
      from: [''],
      to: [''],
      stageId: ['']
    });

    // Suscribirse a cambios de rol para ocultar/limpiar stage cuando no sea student
    this.form.get('role')?.valueChanges.subscribe((role) => {
      if (role !== UserRole.STUDENT) {
        this.form.patchValue({ stageId: '' }, { emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.mode === 'users') {
      const filters: UsersExcelFilterDto = {
        role: this.form.value.role || undefined,
        status: this.form.value.status || undefined,
        stageId: this.form.value.stageId ? Number(this.form.value.stageId) : undefined,
        noClasses: this.form.value.noClasses ?? false
      };
      this.downloadExcel.emit(filters);
    } else {
      const filters: AbsentStudentsExcelFilterDto = {
        instructorId: Number(this.absentForm.value.instructorId),
        from: this.absentForm.value.from,
        to: this.absentForm.value.to,
        stageId: this.absentForm.value.stageId ? Number(this.absentForm.value.stageId) : ('' as any)
      };
     // console.log('Emitting user Excel filters:', filters);
      this.downloadAbsentExcel.emit(filters);
    }
  }

  resetFilters(): void {
    this.form.reset();
  }

  /** Retorna true si debe mostrarse el campo stage */
  showStage(): boolean {
    return this.form.value.role === UserRole.STUDENT || !this.form.value.role;
  }
}