import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { selectUserData } from '../../../store/user.selector';
import { UsersService } from '../../../services/users.service';
import { setDataCompleted, updateUserData } from '../../../store/user.action';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { UserInfoFormComponent } from '../../../components/user-info-form/user-info-form.component';
import { formatBirthday } from '../../../shared/utils/dates.util';
import { InstructorsService } from '../../../services/instructors.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, UserInfoFormComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  userData$: Observable<UserDto | null>;
  user: UserDto | null = null;
  dataCompleted = false;
  showUserInfoForm = false;
  modal: ModalDto = modalInitializer();

  // Campos para contraseña
  isEditingPassword = false;
  showPassword = false;
  newPassword = '';

  constructor(private store: Store, private usersService: UsersService, private instructorsService: InstructorsService) {
    this.userData$ = this.store.select(selectUserData);
    this.userData$.subscribe(user => {
      this.user = user;
      this.dataCompleted = user?.dataCompleted ?? false;
    });
  }


  formatBirthday(dateStr: string | undefined): string {
    return dateStr ? formatBirthday(dateStr) : 'No registrado';
  }

  openEditForm() {
    this.showUserInfoForm = true;
  }

  // Mostrar/ocultar contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Activar o guardar contraseña
  togglePasswordEdit(): void {
    if (!this.isEditingPassword) {
      this.isEditingPassword = true;
      this.newPassword = '';
      console.log('Modo edición activado para cambiar contraseña');
      return;
    }

    if (!this.newPassword.trim()) {
      this.showModal(true, 'Debes ingresar una nueva contraseña antes de guardar.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.showModal(true, 'La contraseña debe tener al menos 6 caracteres.');
      console.warn('⚠️ Contraseña demasiado corta');
      return;
    }

    if (!this.user?.id) return;

    this.usersService.updateUserPassword(this.user.id, this.newPassword).subscribe({
      next: () => {
        this.isEditingPassword = false;
        this.newPassword = '';
        this.showPassword = false;
        this.showModal(false, 'Contraseña actualizada correctamente.');
      },
      error: () => {
        this.showModal(true, 'Error al actualizar la contraseña.');
      },
    });
  }

  handleUserInfoSubmit(data: {
    email: string;
    contact: string;
    city: string;
    country: string;
    occupation: string;
    birthday: string;
    tutorName?: string;
    tutorEmail?: string;
    tutorPhone?: string;
  }) {
    if (!this.user?.id) return;

    const payload: any = {
      emailAddress: data.email,
      birthday: data.birthday,
      contact: data.contact,
      city: data.city,
      country: data.country,
      occupation: data.occupation,
    };

    // 👇 Solo agregamos los campos del tutor si existen
    if (this.user.role === 'STUDENT') {
      if (data.tutorName) payload.tutorName = data.tutorName;
      if (data.tutorEmail) payload.tutorEmail = data.tutorEmail;
      if (data.tutorPhone) payload.tutorPhone = data.tutorPhone;
    }

    this.usersService.update(this.user.id, payload).subscribe({
      next: () => {
        this.showUserInfoForm = false;
        this.store.dispatch(updateUserData({ user: { ...this.user!, ...payload } }));
        this.store.dispatch(setDataCompleted({ completed: true }));
        this.showModal(false, 'Información actualizada con éxito');
      },
      error: (err) => {
        console.error('❌ Error al actualizar usuario:', err);
        this.showModal(true, 'Error al actualizar la información.');
      },
    });
  }

  private showModal(isError: boolean, message: string): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: () => (this.modal.show = false),
    };
    setTimeout(() => (this.modal.show = false), 3000);
  }
}