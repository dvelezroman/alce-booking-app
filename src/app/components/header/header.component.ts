import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,
            CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  isLoggedIn: boolean = false;
  showLogoutModal: boolean = false;

  constructor (private usersService: UsersService, private router: Router){ }

  ngOnInit(): void {
    this.usersService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  toggleNavbar() {
    const navbarBurger = document.querySelector('.navbar-burger');
    const navbarMenu = document.getElementById('navbarBasic');

    if (navbarBurger && navbarMenu) {
      navbarBurger.classList.toggle('is-active');
      navbarMenu.classList.toggle('is-active');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const screenWidth = (event.target as Window).innerWidth;
    const navbarMenu = document.getElementById('navbarBasic');
    const navbarBurger = document.querySelector('.navbar-burger');

    if (screenWidth < 768 && navbarMenu && navbarMenu.classList.contains('is-active')) {
      navbarMenu.classList.remove('is-active');
      if (navbarBurger) {
        navbarBurger.classList.remove('is-active');
      }
    }
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
