import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  toggleNavbar() {
    const navbarBurger = document.querySelector('.navbar-burger');
    const navbarMenu = document.getElementById('navbarBasic');

    if (navbarBurger && navbarMenu) {
      navbarBurger.classList.toggle('is-active');
      navbarMenu.classList.toggle('is-active');
    }
  }
}
