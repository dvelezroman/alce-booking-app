import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { FeatureFlagDto } from '../../../services/dtos/feature-flag.dto';
import { LoginResponseDto } from '../../../services/dtos/user.dto';
import { FeatureFlagService } from '../../../services/feature-flag.service';
import { UsersService } from '../../../services/users.service';
import { UserState } from '../../../store/user.state';

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
  ffs: FeatureFlagDto[] = [];

  loginForm: FormGroup;

  constructor(private fb: FormBuilder,
               private usersService: UsersService,
               private router: Router,
              private store: Store<{ data: UserState }>,
              private ffService: FeatureFlagService,
              ) {
    this.loginForm = this.fb.group({
      // email: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });
    this.user$ = this.store.select('data');
  }

  ngOnInit() {
    this.ffService.getAll().subscribe(ffs => {
      this.ffs = ffs;
    });
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
      this.showModal(this.createModalParams(true, 'El formulario debe estar completado.'));
      return;
    }
    
    const loginFlag = this.ffs.find(f => f.name === 'enable-login');
    if (loginFlag && !loginFlag.status) {
      this.showModal(this.createModalParams(true, 'El inicio de sesión está deshabilitado por el momento.'));
      return;
    }

    const credentials = this.loginForm.value;

    this.usersService.login(credentials).subscribe({
      next: (response: LoginResponseDto) => {
        if (response.register === false) {
            this.router.navigate(['/register-complete']);
        } else {
          this.router.navigate(['/dashboard/home']);
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
