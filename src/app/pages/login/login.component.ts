import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';

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

  constructor(private fb: FormBuilder,
               private usersService: UsersService,
               private router: Router ) {

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

  const credentials = this.loginForm.value;

  this.usersService.login(credentials).subscribe({
    next: (response) => {
      this.showSuccessModal = true;

      setTimeout(() => {
        this.showSuccessModal = false;
        this.router.navigate(['/home']);  
      }, 2000);
    },
    error: (error) => {
      console.error('Error en el login:', error);
      this.showModal = true;

      setTimeout(() => {
        this.showModal = false;
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


}
