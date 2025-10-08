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
  @Input() unreadCount: number | null = 0;
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
  profileNavItem: { icon: string; text: string; route: string; roles: UserRole[] } | null = null;

navItems: { icon: string, text: string, route: string, roles: UserRole[] }[] = [
  { icon: 'home', text: 'Inicio', route: '/dashboard/home', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT] },
  { icon: 'user', text: 'Perfil', route: '/dashboard/profile', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT] },
  { icon: 'event', text: 'Mis Clases', route: '/dashboard/meetings-student', roles: [UserRole.STUDENT] },
  { icon: 'booking', text: 'Agendar', route: '/dashboard/booking', roles: [UserRole.STUDENT] },
  { icon: 'group', text: 'Agenda', route: '/dashboard/searching-meeting', roles: [UserRole.ADMIN] },
  { icon: 'school', text: 'Usuarios', route: '/dashboard/searching-students', roles: [UserRole.ADMIN] },
  { icon: 'asistencias-student', text: 'Asistencias Estudiantes', route: '/dashboard/attendance-student', roles: [UserRole.ADMIN] },
  { icon: 'asistencias-instructor', text: 'Asistencias Instructores', route: '/dashboard/attendance-instructor', roles: [UserRole.ADMIN] },
  { icon: 'link', text: 'Enlaces', route: '/dashboard/link', roles: [UserRole.ADMIN] },
  { icon: 'book', text: 'Contenidos', route: '/dashboard/content', roles: [UserRole.ADMIN] },
  { icon: 'stages', text: 'Stages', route: '/dashboard/stage', roles: [UserRole.ADMIN] },
  { icon: 'create', text: 'Crear Estudiante', route: '/dashboard/create-students', roles: [UserRole.ADMIN] },
  { icon: 'create', text: 'Crear Admin / Instructor', route: '/dashboard/create-instructors', roles: [UserRole.ADMIN] },
  { icon: 'video_call', text: 'Agenda', route: '/dashboard/searching-meeting-instructor', roles: [UserRole.INSTRUCTOR] },
  { icon: 'history', text: 'Eventos', route: '/dashboard/processed-events', roles: [UserRole.ADMIN] },
  { icon: 'config', text: 'Habilitar/Deshabilitar Agendamiento', route: '/dashboard/feature-flag', roles: [UserRole.ADMIN] },
  { icon: 'reporte', text: 'Instructores', route: '/dashboard/report-instructor', roles: [UserRole.ADMIN] },
  { icon: 'reportes', text: 'Estudiante', route: '/dashboard/reports-detailed', roles: [UserRole.ADMIN] },
  { icon: 'reportes', text: 'Usuario', route: '/dashboard/report-user', roles: [UserRole.ADMIN] },
  { icon: 'excel', text: 'Inasistencias / info. de Usuarios', route: '/dashboard/report-excel', roles: [UserRole.ADMIN] },
  { icon: 'reportes', text: 'Reportes de Progreso', route: '/dashboard/reports-progress', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
  { icon: 'test', text: 'Evaluar Estudiante', route: '/dashboard/assessment', roles: [UserRole.INSTRUCTOR] },
  { icon: 'test', text: 'Evaluaciones', route: '/dashboard/assessment-reports', roles: [UserRole.ADMIN] },
  { icon: 'book-open', text: 'Recursos Académicos', route: '/dashboard/resources', roles: [UserRole.ADMIN]},
  { icon: 'book-type', text: 'Tipos de Evaluación',  route: '/dashboard/assessment-types', roles: [UserRole.ADMIN]},
  { icon: 'settings', text: 'Configuración de Evaluación', route: '/dashboard/assessment-config', roles: [UserRole.ADMIN] },
  { icon: 'notifications', text: 'Enviar', route: '/dashboard/broadcast-groups', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR], },
  { icon: 'notifications', text: 'Historial', route: '/dashboard/notifications-status', roles: [UserRole.ADMIN] },
  { icon: 'notifications', text: 'Grupos', route: '/dashboard/notifications-groups', roles: [UserRole.ADMIN] },
  { icon: 'notifications', text: 'Recibidas', route: '/dashboard/notifications-inbox', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT],  },
  { icon: 'notifications', text: 'Enviadas', route: '/dashboard/notifications-sent', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR],  },
  { icon: 'whatsapp', text: 'Enviar mensaje', route: '/dashboard/whatsapp', roles: [UserRole.ADMIN] , },
  { icon: 'whatsapp', text: 'Grupos', route: '/dashboard/whatsapp-groups', roles: [UserRole.ADMIN], },
  { icon: 'whatsapp', text: 'Ajustes de WhatsApp', route: '/dashboard/whatsapp-config', roles: [UserRole.ADMIN], },
  { icon: 'whatsapp', text: 'Mensajes enviados', route: '/dashboard/whatsapp-sent-messages', roles: [UserRole.ADMIN] },
  
  // { icon: 'whatsapp', text: 'Mensajes recibidos', route: '/dashboard/whatsapp-received-messages', roles: [UserRole.ADMIN] },
  { icon: 'email', text: 'Enviar Email', route: '/dashboard/send-emails', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
  { icon: 'inbox', text: 'Inbox Emails', route: '/dashboard/inbox-email', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
  { icon: 'history', text: 'Historial Emails', route: '/dashboard/historial-email', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
  { icon: 'send', text: 'Enviados', route: '/dashboard/sent-email', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
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

        if (window.innerWidth <= 768) {
          this.isSidebarClosed = true;
        }
      }
    });

    const role = this.userData?.role || UserRole.STUDENT;

    const homeItem = this.findNavItemByRoute('/dashboard/home');
    if (homeItem && homeItem.roles.includes(role)) {
      this.homeNavItem = homeItem;
    }

    const profileItem = this.findNavItemByRoute('/dashboard/profile');
    if (profileItem && profileItem.roles.includes(role)) {
      this.profileNavItem = profileItem;
    }


      const grouped = [
    {
      title: 'Clases y Agendamientos',
      icon: 'event',
      items: [
        this.findNavItemByRoute('/dashboard/booking'),
        this.findNavItemByRoute('/dashboard/searching-meeting'),
        this.findNavItemByRoute('/dashboard/searching-meeting-instructor')
      ].filter(item => item.roles.includes(role))
    },
    {
      title: 'Gestión Académica',
      icon: 'school',
      items: [
        this.findNavItemByRoute('/dashboard/searching-students'),
        this.findNavItemByRoute('/dashboard/attendance-student'),
        this.findNavItemByRoute('/dashboard/attendance-instructor'),
        this.findNavItemByRoute('/dashboard/create-students'),
        this.findNavItemByRoute('/dashboard/create-instructors'),
      ].filter(item => item.roles.includes(role))
    },
    {
      title: 'Gestión de Eventos',
      icon: 'history',
      items: [this.findNavItemByRoute('/dashboard/processed-events'),
      ].filter(item => item.roles.includes(role))
    },
    {
      title: 'Administración de Recursos',
      icon: 'link',
      items: [
        this.findNavItemByRoute('/dashboard/link'),
        this.findNavItemByRoute('/dashboard/stage'),
        this.findNavItemByRoute('/dashboard/content'),
        this.findNavItemByRoute('/dashboard/resources'),
        this.findNavItemByRoute('/dashboard/assessment-types')
      ].filter(item => item.roles.includes(role))
    },
    {
      title: 'Evaluaciones',
      icon: 'test',
      items: [
        this.findNavItemByRoute('/dashboard/assessment')
      ].filter(item => item.roles.includes(role))
    },
    {
      title: 'Reportes',
      icon: 'reportes',
      items: [
        this.findNavItemByRoute('/dashboard/report-user'),
        this.findNavItemByRoute('/dashboard/report-excel'),
        this.findNavItemByRoute('/dashboard/report-instructor'),
        this.findNavItemByRoute('/dashboard/reports-detailed'),
        this.findNavItemByRoute('/dashboard/reports-progress'),
        this.findNavItemByRoute('/dashboard/assessment-reports')
      ].filter(item => item.roles.includes(role))
    },
    {
      title: 'Notificaciones',
      icon: 'notifications',
      items: [
        this.findNavItemByRoute('/dashboard/broadcast-groups'),
        this.findNavItemByRoute('/dashboard/notifications-status'),
        this.findNavItemByRoute('/dashboard/notifications-groups'),
        this.findNavItemByRoute('/dashboard/notifications-inbox'),
        this.findNavItemByRoute('/dashboard/notifications-sent'),
      ].filter(item => item.roles.includes(role))
    },
    {
      title: 'Emails',
      icon: 'email',
      items: [
        this.findNavItemByRoute('/dashboard/send-emails'),
        // this.findNavItemByRoute('/dashboard/inbox-email'),
        this.findNavItemByRoute('/dashboard/historial-email'),
        // this.findNavItemByRoute('/dashboard/sent-email'),
      ].filter(item => item.roles.includes(role))
    },
   
    {
      title: 'WhatsApp',
      icon: 'whatsapp',
      items: [
        this.findNavItemByRoute('/dashboard/whatsapp'),
        this.findNavItemByRoute('/dashboard/whatsapp-groups'),
        this.findNavItemByRoute('/dashboard/whatsapp-sent-messages'),
        // this.findNavItemByRoute('/dashboard/whatsapp-received-messages'),
      ].filter(item => item.roles.includes(role))
    },
    {
      title: 'Configuración',
      icon: 'config',
      items: [
        this.findNavItemByRoute('/dashboard/feature-flag'),
        this.findNavItemByRoute('/dashboard/assessment-config'),
        this.findNavItemByRoute('/dashboard/whatsapp-config'),
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
    if (window.innerWidth <= 768) {
      this.isSidebarClosed = true;
    }
    
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
    this.router.navigate(['/home']);
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
