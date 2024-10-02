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
    { icon: 'fas fa-home', text: 'Home', route: '/home', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT] },
    { icon: 'fas fa-calendar-alt', text: 'Booking', route: '/booking', roles: [UserRole.STUDENT] },
    { icon: 'fas fa-calendar-alt', text: 'Meetings', route: '/searching-meeting', roles: [UserRole.ADMIN] },
    { icon: 'fas fa-calendar-alt', text: 'Students', route: '/searching-students', roles: [UserRole.ADMIN] },
    { icon: 'fas fa-calendar-alt', text: 'Stages', route: '/stage', roles: [UserRole.ADMIN] },
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
