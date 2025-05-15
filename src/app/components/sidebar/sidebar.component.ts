import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { UserDto, UserRole } from '../../services/dtos/user.dto';
import { Observable } from 'rxjs';
import { selectIsAdmin, selectUserData } from '../../store/user.selector';
import { Store } from '@ngrx/store';
import { ModalDto, modalInitializer } from '../modal/modal.dto';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ModalComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarClosed = false;
  @Output() toggleSidebarEvent = new EventEmitter<unknown>();
  @Output() logoutEvent = new EventEmitter<void>();

  showLogoutModal = false;
  modalConfig: ModalDto = modalInitializer();
  isAdmin$: Observable<boolean>;
  isAdmin: boolean = false;
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;
  categoryStates: Record<string, boolean> = {};
  currentRoute: string = '';
  homeNavItem: { icon: string; text: string; route: string; roles: UserRole[] } | null = null;

  navItems: { icon: string, text: string, route: string, roles: UserRole[] }[] = [
    { icon: 'home', text: 'Inicio', route: '/home', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT] },
    { icon: 'event', text: 'Mis Clases', route: '/meetings-student', roles: [UserRole.STUDENT] },
    { icon: 'booking', text: 'Agendar', route: '/booking', roles: [UserRole.STUDENT] },
    { icon: 'group', text: 'Agenda', route: '/searching-meeting', roles: [UserRole.ADMIN] },
    { icon: 'school', text: 'Usuarios', route: '/searching-students', roles: [UserRole.ADMIN] },
    { icon: 'asistencias-student', text: 'Asistencias Estudiantes', route: '/asistencias-alumnos', roles: [UserRole.ADMIN] },
    { icon: 'asistencias-instructor', text: 'Asistencias Instructores', route: '/asistencias-instructor', roles: [UserRole.ADMIN] },
    { icon: 'link', text: 'Enlaces', route: '/link', roles: [UserRole.ADMIN] },
    { icon: 'book', text: 'Contenidos', route: '/content', roles: [UserRole.ADMIN] },
    { icon: 'stages', text: 'Stages', route: '/stage', roles: [UserRole.ADMIN] },
    { icon: 'create', text: 'Crear Estudiante', route: '/create-students', roles: [UserRole.ADMIN] },
    { icon: 'create', text: 'Crear Admin / Instructor', route: '/create-instructors', roles: [UserRole.ADMIN] },
    { icon: 'video_call', text: 'Agenda', route: '/searching-meeting-instructor', roles: [UserRole.INSTRUCTOR] },
    { icon: 'history', text: 'Eventos', route: '/processed-events', roles: [UserRole.ADMIN] },
    { icon: 'config', text: 'Habilitar/Deshabilitar Agendamiento', route: '/feature-flag', roles: [UserRole.ADMIN] },
    { icon: 'reportes', text: 'Reportes de Estudiante', route: '/reports-detailed', roles: [UserRole.ADMIN] },
    { icon: 'reportes', text: 'Reportes de Progreso', route: '/reports-progress', roles: [UserRole.ADMIN] },
  ];

  navGrouped: {
    title: string;
    icon: string;
    items: { icon: string; text: string; route: string; roles: UserRole[] }[];
  }[] = [];

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
    });

    this.currentRoute = this.router.url;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });

    const role = this.userData?.role || UserRole.STUDENT;

    const homeItem = this.findNavItemByRoute('/home');
    if (homeItem && homeItem.roles.includes(role)) {
      this.homeNavItem = homeItem;
    }


    const grouped = [

      {
        title: 'Clases y Agendamientos',
        icon: 'event',
        items: [
          // this.findNavItemByRoute('/meetings-student'),
          this.findNavItemByRoute('/booking'),
          this.findNavItemByRoute('/searching-meeting'),
          this.findNavItemByRoute('/searching-meeting-instructor')
        ].filter(item => item.roles.includes(role))
      },
      {
        title: 'Gestión Académica',
        icon: 'school',
        items: [
          this.findNavItemByRoute('/searching-students'),
          this.findNavItemByRoute('/asistencias-alumnos'),
          this.findNavItemByRoute('/asistencias-instructor'),
          this.findNavItemByRoute('/create-students'),
          this.findNavItemByRoute('/create-instructors')
        ].filter(item => item.roles.includes(role))
      },
      {
        title: 'Gestión de Eventos',
        icon: 'history',
        items: [this.findNavItemByRoute('/processed-events')].filter(item => item.roles.includes(role))
      },
      {
        title: 'Administración de Recursos',
        icon: 'link',
        items: [
          this.findNavItemByRoute('/link'),
          this.findNavItemByRoute('/stage'),
          this.findNavItemByRoute('/content')
        ].filter(item => item.roles.includes(role))
      },
     {
        title: 'Reportes',
        icon: 'reportes',
        items: [
          this.findNavItemByRoute('/reports-detailed'),
          this.findNavItemByRoute('/reports-progress') 
        ].filter(item => item.roles.includes(role))
      },
      {
        title: 'Configuración',
        icon: 'config',
        items: [
          this.findNavItemByRoute('/feature-flag') 
        ].filter(item => item.roles.includes(role))
      }
    ];

      this.navGrouped = grouped.filter(group => group.items.length > 0);

      for (const group of this.navGrouped) {
        this.categoryStates[group.title] = false;
    }
  }

  isCategoryActive(items: { icon: string; text: string; route: string; roles: UserRole[] }[]): boolean {
    return items
      .filter(item => item.route) 
      .some(item => this.currentRoute === item.route || this.currentRoute.startsWith(item.route + '/'));
  }


  findNavItemByRoute(route: string) {
    return this.navItems.find(item => item.route === route)!;
  }

  openSidebar(event: Event) {
    event.stopPropagation();
    this.isSidebarClosed = false;
  }

  closeSidebar(event: Event) {
    event.stopPropagation();
    this.isSidebarClosed = true;

    for (const title in this.categoryStates) {
      if (this.categoryStates.hasOwnProperty(title)) {
        this.categoryStates[title] = false;
      }
    }
  }

  openLogoutModal(): void {
    this.modalConfig = {
      show: true,
      message: "¿Estás seguro de cerrar sesión?",
      isError: false,
      isSuccess: false,
      isInfo: true,
      showButtons: true,
      close: () => this.closeLogoutModal(),
      confirm: () => this.onConfirmLogout()
    };
  }

  closeLogoutModal() {
    this.modalConfig.show = false;
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

  toggleCategory(title: string) {
    for (const key in this.categoryStates) {
      if (key === title) {
        this.categoryStates[key] = !this.categoryStates[key];
      } else {
        this.categoryStates[key] = false;
      }
    }
  }

  protected readonly UserRole = UserRole;
}
