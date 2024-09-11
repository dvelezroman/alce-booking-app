import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { UserDto } from '../../services/dtos/user.dto';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  currentPage = 'register';
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  showModal = false;
  showSuccessModal = false;
  showRegistrationErrorModal = false;
  registerForm: FormGroup;
  error: Error | undefined;

  roles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];


  constructor(private fb: FormBuilder,
              private usersService: UsersService,
              private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }


  ngOnInit(): void {

  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }


  onSubmit() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.showModal = true;

      setTimeout(() => {
        this.showModal = false;
      }, 2000);

      return;
    }

    const userData: Partial<UserDto> = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role,
    };

    this.usersService.register(userData).subscribe({
      next: () => {
        this.showSuccessModal = true;

        setTimeout(() => {
          this.showSuccessModal = false;
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (error) => {
        this.error = error.error;
        console.error('Error en el registro:', error);
        this.showRegistrationErrorModal = true;
        if (error.status === 400) {
          console.error('Error de validación en el servidor');
          this.showRegistrationErrorModal = true;
        } else if (error.status === 0) {
          console.error('Error de conexión al servidor');
          this.showRegistrationErrorModal = true;
        } else {
          console.error('Error desconocido');
          this.showRegistrationErrorModal = true;
        }

        setTimeout(() => {
          this.showRegistrationErrorModal = false;
        }, 2000);

      }
    });
  }


  closeModal() {
    this.showModal = false;
    this.showSuccessModal = false;
  }
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
