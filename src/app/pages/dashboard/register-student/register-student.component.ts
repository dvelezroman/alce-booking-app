import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { Stage, RegisterStudentDto, Mode, StudentClassification } from '../../../services/dtos/student.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { StagesService } from '../../../services/stages.service';
import { StudentsService } from '../../../services/students.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [CommonModule,
            RouterModule,
            ReactiveFormsModule,
            ModalComponent],
  templateUrl: './register-student.component.html',
  styleUrl: './register-student.component.scss'
})
export class RegisterStudentComponent implements OnInit {
  modal: ModalDto = modalInitializer();

  registerForm: FormGroup;
  stages: Stage[] = [];

  modes = Object.values(Mode);
  studentClassifications = Object.values(StudentClassification);


  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private usersService: UsersService,
    private stagesService: StagesService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idNumber: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      studentClassification: ['', Validators.required],
      stageId: ['', Validators.required],
      mode: ['', Validators.required],
      startClassDate: [''],
      endClassDate: [''], 
    });
  }

  ngOnInit(): void {
    this.stagesService.getAll().subscribe((stages) => {
      this.stages = this.filterAndSortStages(stages);
    });
  }

  private filterAndSortStages(stages: Stage[]): Stage[] {
    return stages
      .filter(stage => {
        const desc = stage.description.toUpperCase();
        return !desc.startsWith('K-STG') && desc !== 'STAGE 1.0';
      })
      .sort((a, b) => {
        const getNumber = (desc: string) => {
          const match = desc.match(/\d+(\.\d+)?/);
          return match ? parseFloat(match[0]) : 0;
        };

        return getNumber(a.description) - getNumber(b.description);
      });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.showModal(this.createModalParams(true, 'El formulario debe ser completado.'));
      return;
    }

    const userData: Omit<UserDto, 'id'> = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      idNumber: this.registerForm.value.idNumber.toString(),
      role: UserRole.STUDENT,
    };

     const startClassDate = this.registerForm.value.startClassDate
        ? new Date(this.registerForm.value.startClassDate).toISOString()
        : null;

      const endClassDate = this.registerForm.value.endClassDate
        ? new Date(this.registerForm.value.endClassDate).toISOString()
        : null;

    this.usersService.create(userData).subscribe({
      next: (userResponse) => {
        const studentData: RegisterStudentDto = {
          userId: userResponse.user.id,
          stageId: parseInt(this.registerForm.value.stageId, 10),
          mode: this.registerForm.value.mode,
          studentClassification: this.registerForm.value.studentClassification,
          startClassDate,
          endClassDate
        };

        this.studentsService.registerStudent(studentData).subscribe({
          next: () => {
            this.showModal(this.createModalParams(false, 'Registro exitoso.'));
            setTimeout(() => {
              this.router.navigate(['/students']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error al registrar estudiante:', error);
            this.showModal(this.createModalParams(true, 'No se pudo registrar el estudiante.'));
          },
        });
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.showModal(this.createModalParams(true, 'No se pudo registrar el usuario.'));
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal,
    };
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 2500);
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  };
}
