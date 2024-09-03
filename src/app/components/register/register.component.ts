import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  registerForm: FormGroup;


  constructor(private fb: FormBuilder) {

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
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

    this.showSuccessModal = true;
  
    setTimeout(() => {
      this.showSuccessModal = false;
    }, 2000);
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
