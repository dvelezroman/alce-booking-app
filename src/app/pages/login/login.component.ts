import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {UsersService} from '../../services/users.service';
import {Observable} from "rxjs";
import {UserState} from "../../store/user.state";
import {Store} from "@ngrx/store";
import {LoginResponseDto} from "../../services/dtos/user.dto";
import {ModalDto, modalInitializer} from '../../components/modal/modal.dto';
import {ModalComponent} from '../../components/modal/modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ModalComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  currentPage = 'login';
  user$: Observable<UserState>;
  modal: ModalDto = modalInitializer();
  passwordVisible: boolean = false;


  loginForm: FormGroup;

  constructor(private fb: FormBuilder,
               private usersService: UsersService,
               private router: Router,
              private store: Store<{ data: UserState }>
              ) {
    this.loginForm = this.fb.group({
      // email: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required]],
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
      this.showModal(this.createModalParams(true, 'El formulario debe estar completado.'));
      return;
    }
    const credentials = this.loginForm.value;

    this.usersService.login(credentials).subscribe({
      next: (response: LoginResponseDto) => {
        if (response.register === false) {
            this.router.navigate(['/register-complete']);
        } else {
          this.router.navigate(['/home']);
          this.showModal(this.createModalParams(false, 'Inicio de sesión exitoso.'));
        }
    },
      error: (error) => {
        this.showModal(this.createModalParams(true, error.error.message));
      }
    });
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };

    setTimeout(() => {
      this.modal.close();
    }, 2500);
  }

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: () => this.closeModal()
    };
  }

  closeModal() {
    this.modal.show = false;
  }

onPasswordInput(): void {
  const passwordControl = this.loginForm.get('password');
}

togglePasswordVisibility() {
  this.passwordVisible = !this.passwordVisible;
}


}
