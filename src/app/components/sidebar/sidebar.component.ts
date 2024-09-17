import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';

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
export class SidebarComponent {
  @Input() isSidebarClosed = false;
  @Output() toggleSidebarEvent = new EventEmitter<unknown>();
  @Output() logoutEvent = new EventEmitter<void>();

  showLogoutModal = false;
  
  navItems = [
    { icon: 'fas fa-home', text: 'Home', route: '/home' },
    { icon: 'fas fa-info-circle', text: 'About' },
    { icon: 'fas fa-envelope', text: 'Contact', route: '/contact' },
    { icon: 'fas fa-calendar-alt', text: 'Booking', route: '/booking' },
    { icon: 'fas fa-calendar-alt', text: 'Stages', route: '/stage' }
  ];

  constructor(private usersService: UsersService, private router: Router) {}

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
}
