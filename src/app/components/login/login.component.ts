import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  currentPage = 'login';
  showModal = false;
  showSuccessModal = false;
  passwordVisible: boolean = false;

  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

  }

  ngOnInit(): void {
}

private markFormGroupTouched(formGroup: FormGroup) {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();
    control?.markAsDirty();
  });
}

onSubmit() {
  if (this.loginForm.invalid) {
    this.markFormGroupTouched(this.loginForm);  
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


}
