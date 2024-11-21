import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import {UserDto, UserRole} from '../../services/dtos/user.dto';
import { Observable } from 'rxjs';
import {selectIsAdmin, selectUserData} from '../../store/user.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarClosed = false;
  @Output() toggleSidebarEvent = new EventEmitter<unknown>();
  @Output() logoutEvent = new EventEmitter<void>();

  showLogoutModal = false;
  isAdmin$: Observable<boolean>;
  isAdmin: boolean = false;
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;

  navItems: { icon: string, text: string, route: string, roles: UserRole[] }[] = [
    { icon: 'home', text: 'Inicio', route: '/home', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT] },
    { icon: 'booking', text: 'Agendar', route: '/booking', roles: [UserRole.STUDENT] },
    { icon: 'group', text: 'Agenda', route: '/searching-meeting', roles: [UserRole.ADMIN] },
    { icon: 'school', text: 'Usuarios', route: '/searching-students', roles: [UserRole.ADMIN] },
    { icon: 'asistencias', text: 'Asistencias', route: '/asistencias-alumnos', roles: [UserRole.ADMIN] },
    { icon: 'asistencias', text: 'Asistencias Instructores', route: '/asistencias-instructor', roles: [UserRole.ADMIN] },
    { icon: 'link', text: 'Enlaces', route: '/link', roles: [UserRole.ADMIN] },
    { icon: 'stages', text: 'Stages', route: '/stage', roles: [UserRole.ADMIN] },
    { icon: 'school', text: 'Crear Estudiante', route: '/create-students', roles: [UserRole.ADMIN] },
    { icon: 'video_call', text: 'Agenda', route: '/searching-meeting-instructor', roles: [UserRole.INSTRUCTOR] },
    { icon: 'link', text: 'Configuración', route: '/feature-flag', roles: [UserRole.ADMIN] }
];

  constructor(
    private usersService: UsersService,
    private router: Router,
    private store: Store,
  ) {
    this.userData$ = this.store.select(selectUserData);
    this.isAdmin$ = this.store.select(selectIsAdmin);
  }

  ngOnInit() {
    this.userData$.subscribe(state => {
      this.userData = state;
    });
    this.isAdmin$.subscribe(state => {
      this.isAdmin = state;
    })
  }

  openSidebar(event: Event) {
    event.stopPropagation();
    this.isSidebarClosed = false;
  }

  closeSidebar(event: Event) {
    event.stopPropagation();
    this.isSidebarClosed = true;
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }


  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  onConfirmLogout() {
    this.usersService.logout();
    this.router.navigate(['/login']);
    this.closeLogoutModal();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.sidebar');
    const isClickInsideSidebar = sidebar?.contains(target);

    if (!isClickInsideSidebar && window.innerWidth <= 768) {
      this.isSidebarClosed = true;
    }
  }

  protected readonly UserRole = UserRole;
}
