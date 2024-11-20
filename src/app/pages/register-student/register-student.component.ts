import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterStudentDto } from '../../services/dtos/student.dto';
import { UserDto, UserRole } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';
import { StudentsService } from '../../services/students.service';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../store/user.selector';

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
  confirmPasswordVisible: boolean = false; 
  modal: ModalDto = modalInitializer(); 
  user: UserDto | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private studentsService: StudentsService,
    private router: Router,
    private store: Store
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      birthday: ['', Validators.required],
      role: ['STUDENT'], 
      mode: ['', Validators.required],
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((userData: UserDto | null) => {
      this.user = userData;
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onPasswordInput(): void {
    const passwordControl = this.registerForm.get('password');
    passwordControl?.markAsTouched();
    passwordControl?.markAsDirty();
  }
  
  onConfirmPasswordInput(): void {
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    confirmPasswordControl?.markAsTouched();
    confirmPasswordControl?.markAsDirty();
  }
  
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
  
  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
  
  onSubmit() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.showModal(this.createModalParams(true, 'El formulario debe ser completado.'));
      return;
    }
  
    const userData: UserDto = {
      id: 0, 
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      idNumber: this.registerForm.value.idNumber,
      birthday: new Date(this.registerForm.value.birthday).toISOString().split('T')[0],
      role: UserRole.STUDENT, 
    };
  
    const studentData: RegisterStudentDto = {
      userId: null, 
      mode: this.registerForm.value.mode,
      stageId: undefined, 
    };
  
    this.usersService.register(userData).subscribe({
      next: (userResponse) => {
        studentData.userId = userResponse.user.id;
  
        this.studentsService.registerStudent(studentData).subscribe({
          next: () => {
            this.showModal(this.createModalParams(false, 'Registro exitoso.'));
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Error al registrar estudiante:', error);
            this.showModal(this.createModalParams(true, 'No se pudo registrar el estudiante.'));
          },
        });
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        this.showModal(this.createModalParams(true, 'No se pudo registrar el usuario.'));
      },
    });
  }
  
  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal
    };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
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
