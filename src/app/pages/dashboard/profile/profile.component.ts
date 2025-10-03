import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { selectUserData } from '../../../store/user.selector';
import { formatBirthday } from '../../../shared/utils/dates.util';
import { UserInfoFormComponent } from '../../../components/user-info-form/user-info-form.component';
import { UsersService } from '../../../services/users.service';
import { setDataCompleted } from '../../../store/user.action';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ModalComponent } from '../../../components/modal/modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
     CommonModule,
     UserInfoFormComponent,
     ModalComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userData$: Observable<UserDto | null>;
  showUserInfoForm = false;
  modal: ModalDto = modalInitializer();

  constructor(private store: Store, private usersService: UsersService) {
    this.userData$ = this.store.select(selectUserData);
  }

  formatBirthday(dateStr: string | undefined): string {
    return dateStr ? formatBirthday(dateStr) : 'No registrado';
  }

  openEditForm() {
    this.showUserInfoForm = true;
  }

  handleUserInfoSubmit(data: { email: string; contact: string; city: string; country: string }) {
    console.log(" Evento recibido del hijo:", data); 
    this.userData$.pipe(take(1)).subscribe(user => {
      if (!user?.id) return;

      const payload = {
        emailAddress: data.email,
        contact: data.contact,
        city: data.city,
        country: data.country,
      };

      this.usersService.update(user.id, payload).subscribe({
        next: () => {
          this.showUserInfoForm = false;
          this.store.dispatch(setDataCompleted({ completed: true }));
          this.showModal(false, 'Información actualizada con éxito');
        },
        error: () => {
          this.showModal(true, 'Error al actualizar la información');
        }
      });
    });
  }

  private showModal(isError: boolean, message: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: () => (this.modal.show = false)
    };


    setTimeout(() => {
      this.modal.show = false;
    }, 3000);
  }
}