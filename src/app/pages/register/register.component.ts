import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {ModalComponent} from "../../components/modal/modal.component";
import {ModalDto, modalInitializer} from "../../components/modal/modal.dto";
import { UsersService } from '../../services/users.service';
import { UserDto } from '../../services/dtos/user.dto';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ModalComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent implements OnInit {
  currentPage = 'register';
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  registerForm: FormGroup;
  error: Error | undefined;
  modal: ModalDto = modalInitializer();


  constructor(private fb: FormBuilder,
              private usersService: UsersService,
              private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }


  ngOnInit(): void {}

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
      this.showModal(this.createModalParams(true, 'El formulario debe ser completado.'));
      return;
    }

    const userData: Partial<UserDto> = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.usersService.register(userData).subscribe({
      next: () => {
        this.showModal(this.createModalParams(false, 'El usuario se registró correctamente.', 'login'));
      },
      error: (error) => {
        this.error = error.error;
        this.showModal(this.createModalParams(true, this.error?.message || 'El usuario no se pudo registrar'));
      }
    });
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
  }

  closeModal = (redirect?: string) => {
    this.modal = { ...modalInitializer() };
    if (redirect) {
      this.router.navigate([`/${redirect}`]);
    }
  }

  createModalParams(isError: boolean, message: string, redirect?: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: () => this.closeModal(redirect), // Arrow function ensures `this` is correctly bound
    };
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
