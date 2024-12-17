import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterStudentDto, Stage } from '../../services/dtos/student.dto';
import { StudentsService } from '../../services/students.service';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { StagesService } from '../../services/stages.service';
import { UserDto, UserRole } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';

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
  registerForm: FormGroup;
  stages: Stage[] = [];
  modes: string[] = ['PRESENCIAL', 'ONLINE'];
  modal: ModalDto = modalInitializer();


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
      stageId: ['', Validators.required],
      mode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.stagesService.getAll().subscribe(stages => {
      this.stages = stages;
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

    this.usersService.create(userData).subscribe({
      next: (userResponse) => {
        const studentData: RegisterStudentDto = {
          userId: userResponse.user.id,
          stageId: parseInt(this.registerForm.value.stageId, 10),
          mode: this.registerForm.value.mode,
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
