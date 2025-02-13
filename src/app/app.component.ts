import { HeaderComponent } from './components/header/header.component';
import {Component, LOCALE_ID, OnInit} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {SpinnerComponent} from "./components/spinner/spinner.component";
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UsersService } from './services/users.service';
import {CommonModule, registerLocaleData} from '@angular/common';
import {selectIsLoggedIn, selectIsRegistered, selectUserData} from "./store/user.selector";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {setAdminStatus, setLoggedInStatus, unsetUserData} from "./store/user.action";
import {UserDto, UserRole} from "./services/dtos/user.dto";
import localeEs from '@angular/common/locales/es';
import { ModalDto, modalInitializer } from './components/modal/modal.dto';
import { ModalComponent } from './components/modal/modal.component';
import {IdleService} from "./services/idle-service";

registerLocaleData(localeEs)

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SpinnerComponent,
    HeaderComponent,
    SidebarComponent,
    CommonModule,
    ModalComponent
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  modal: ModalDto = modalInitializer();
  isOffline: boolean = !navigator.onLine;

  isLoggedIn$: Observable<boolean>;
  isLoggedIn = false;
  isSidebarClosed = true;
  isRegistered$: Observable<boolean | undefined>;
  isRegistered: boolean | undefined = false;
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;

  constructor(
    private usersService: UsersService,
    private store: Store,
    private router: Router,
    private idleService: IdleService,
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.isRegistered$ = this.store.select(selectIsRegistered);
    this.userData$ = this.store.select(selectUserData);
  }


  ngOnInit() {
    this.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
    });
    this.userData$.subscribe(state => {
      // console.log(state);
      this.userData = state;
    });
    this.isRegistered$.subscribe(state => {
      this.isRegistered = state;
      if (this.isLoggedIn && !this.isRegistered) {
        this.router.navigate(['register-complete']);
      }
    });

     // Detectar pérdida y recuperación de conexión
     window.addEventListener('offline', () => {
      this.isOffline = true;
      this.showModal(this.createModalParams(true, 'Sin conexión a internet'));
    });

    window.addEventListener('online', () => {
      this.isOffline = false;
      this.showModal(this.createModalParams(false, 'Conectado a internet'));
    });

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    if (!this.isLoggedIn && accessToken) {
      this.usersService.refreshLogin().subscribe({
        error: () => {
          this.store.dispatch(setLoggedInStatus({ isLoggedIn: false }));
          this.store.dispatch(setAdminStatus({ isAdmin: false }));
          this.store.dispatch(unsetUserData());
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.removeItem('accessToken');
          }
        }
      });
    }
  }

  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }

  onConfirmLogout() {
    this.usersService.logout();
    this.router.navigate(['/login']);
  }

  protected readonly UserRole = UserRole;

   showModal(params: ModalDto) {
    this.modal = { ...params };

    setTimeout(() => {
      this.modal.close();
    }, 2000);
  }

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: () => this.closeModal(),
    };
  }

  closeModal() {
    this.modal = { ...modalInitializer() };
  }
}
