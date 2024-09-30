import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { UserDto } from '../../services/dtos/user.dto';
import { Observable } from 'rxjs';
import { selectUserData } from '../../store/user.selector';
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
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;

  navItems: { icon: string, text: string, route: string}[] = [
    { icon: 'fas fa-home', text: 'Home', route: '/home' },
    { icon: 'fas fa-info-circle', text: 'About', route: '/about' },
    { icon: 'fas fa-envelope', text: 'Contact', route: '/contact' },
    { icon: 'fas fa-calendar-alt', text: 'Booking', route: '/booking' },
    { icon: 'fas fa-calendar-alt', text: 'Stages', route: '/stage' }
  ];

  constructor(private usersService: UsersService,
              private router: Router,
              private store: Store) {

    this.userData$ = this.store.select(selectUserData);

  }

  ngOnInit() {
    this.userData$.subscribe(state => {
      this.userData = state;
    });
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
}
