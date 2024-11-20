import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterStudentDto } from '../../services/dtos/student.dto';
import { UserDto } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';
import { StudentsService } from '../../services/students.service';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [CommonModule,
            RouterModule,
            ReactiveFormsModule],
  templateUrl: './register-student.component.html',
  styleUrl: './register-student.component.scss'
})
export class RegisterStudentComponent implements OnInit {
  registerForm: FormGroup;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;  

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private studentsService: StudentsService,
    private router: Router
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

  ngOnInit(): void {}

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
      return;
    }

    const userData: Partial<UserDto> = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      idNumber: this.registerForm.value.idNumber,
      birthday: new Date(this.registerForm.value.birthday).toISOString().split('T')[0],
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role
    };

    const studentData: RegisterStudentDto = {
      userId: 0, 
      mode: this.registerForm.value.mode
    };

    this.usersService.register(userData).subscribe({
      next: (response: any) => {
        console.log('User ID:', response.user.id); 
        studentData.userId = response.user.id;
      },
      error: (error) => console.error('Error al registrar usuario:', error)
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}
