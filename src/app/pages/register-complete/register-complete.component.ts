import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { UserDto } from '../../services/dtos/user.dto';


@Component({
  selector: 'app-register-complete',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './register-complete.component.html',
  styleUrl: './register-complete.component.scss'
})
export class RegisterCompleteComponent implements OnInit {
  currentPage = 'register';
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  showModal = false;
  showSuccessModal = false;
  showRegistrationErrorModal = false;
  registerForm: FormGroup;

  roles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];


  constructor(private fb: FormBuilder,
              private usersService: UsersService,
              private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      birthday: ['', Validators.required],
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

    const userData: UserDto = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role,
      idNumber: this.registerForm.value.idNumber,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      birthday: new Date(this.registerForm.value.birthday).toISOString().split('T')[0]
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
        console.error('Error en el registro:', error);
        this.showRegistrationErrorModal = true;

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
