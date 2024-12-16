import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterStudentDto, Stage } from '../../services/dtos/student.dto';
import { StudentsService } from '../../services/students.service';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { StagesService } from '../../services/stages.service';

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
  passwordVisible: boolean = false;
  stages: Stage[] = [];
  modes: string[] = ['PRESENCIAL', 'ONLINE'];
  modal: ModalDto = modalInitializer();


  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private stagesService: StagesService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
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

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.showModal(this.createModalParams(true, 'El formulario debe ser completado.'));
      return;
    }
  
    const studentData: RegisterStudentDto = {
      userId: null,
      stageId: this.registerForm.value.stageId,
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
        this.showModal(this.createModalParams(true, 'No se pudo completar el registro.'));
      }
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