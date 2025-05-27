import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UsersService } from './services/users.service';
import { Store } from '@ngrx/store';
import { setLoggedInStatus, setAdminStatus, unsetUserData } from './store/user.action';
import { ModalDto, modalInitializer } from './components/modal/modal.dto';
import { ModalComponent } from './components/modal/modal.component';

import localeEs from '@angular/common/locales/es';
import { SpinnerComponent } from './components/spinner/spinner.component';

registerLocaleData(localeEs);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ModalComponent,
    SpinnerComponent
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isOffline: boolean = !navigator.onLine;
  modal: ModalDto = modalInitializer();

  constructor(
    private usersService: UsersService,
    private store: Store
  ) {}

  ngOnInit() {
    // Estado de conexión
    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.showModal(this.createModalParams(true, 'Sin conexión a internet'));
    });

    window.addEventListener('online', () => {
      this.isOffline = false;
      this.showModal(this.createModalParams(false, 'Conectado a internet'));
    });

    // Verificar token guardado
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      this.usersService.refreshLogin().subscribe({
        error: () => {
          this.store.dispatch(setLoggedInStatus({ isLoggedIn: false }));
          this.store.dispatch(setAdminStatus({ isAdmin: false }));
          this.store.dispatch(unsetUserData());
          localStorage.removeItem('accessToken');
        }
      });
    }
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => this.modal.close(), 2000);
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
    this.modal = { ...modalInitializer() };
  }
}