import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import {Observable} from "rxjs";
import {UserState} from "../../store/user.state";
import {Store} from "@ngrx/store";
import {LoginResponseDto} from "../../services/dtos/user.dto";

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
  user$: Observable<UserState>;
  showModal = false;
  showSuccessModal = false;
  showCredentialsErrorModal = false;
  passwordVisible: boolean = false;


  loginForm: FormGroup;

  constructor(private fb: FormBuilder,
               private usersService: UsersService,
               private router: Router,
              private store: Store<{ data: UserState }>
              ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.user$ = this.store.select('data');
  }

  ngOnInit(): void {}

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
    next: (response: LoginResponseDto) => {
      if (response.register === false) {
        this.router.navigate(['/register-complete']);
      } else {
        this.router.navigate(['/home']);
      }
      this.showSuccessModal = true;
      setTimeout(() => {
        this.showSuccessModal = false;
      }, 2000);
    },
    error: (error) => {
      if (error.status === 401) {
        this.showCredentialsErrorModal = true;
        setTimeout(() => {
          this.showCredentialsErrorModal = false;
        }, 2000);
      } else {
        this.showModal = true;

        setTimeout(() => {
          this.showModal = false;
        }, 2000);
      }
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
