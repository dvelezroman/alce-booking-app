import { Component } from '@angular/core';
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
export class HeaderComponent {

  constructor (private usersService: UsersService, private router: Router){}

  toggleNavbar() {
    const navbarBurger = document.querySelector('.navbar-burger');
    const navbarMenu = document.getElementById('navbarBasic');

    if (navbarBurger && navbarMenu) {
      navbarBurger.classList.toggle('is-active');
      navbarMenu.classList.toggle('is-active');
    }
  }

  onLogout() {
    this.usersService.logout();  
    this.router.navigate(['/login']);  
  }
}
