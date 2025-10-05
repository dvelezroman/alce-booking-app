import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { UsersService } from '../../../services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  modal: ModalDto = modalInitializer();
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const email = this.form.value.email;

    this.usersService.requestPasswordReset(email).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.modal = {
          ...modalInitializer(),
          show: true,
          isSuccess: true,
          message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.',
          close: () => (this.modal.show = false),
        };
        setTimeout(() => this.modal.show = false, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;

        let errorMessage = 'Ocurrió un error. Verifica tu correo e inténtalo nuevamente.';
        if (err?.error?.message) {
          errorMessage = err.error.message;
        }

        this.modal = {
          ...modalInitializer(),
          show: true,
          isError: true,
          message: errorMessage,
          close: () => (this.modal.show = false),
        };

        setTimeout(() => this.modal.show = false, 3500);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}