import { Component, HostListener, OnInit } from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import {Store} from "@ngrx/store";
import {selectIsLoggedIn} from "../../store/user.selector";
import {filter, Observable} from "rxjs";
import {UserDto} from "../../services/dtos/user.dto";


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
  currentPage: string = '';
  isLoggedIn$: Observable<boolean>;
  user: UserDto | null | undefined;
  isLoggedIn: boolean = false;
  showLogoutModal: boolean = false;

  constructor (
    private usersService: UsersService,
    private router: Router,
    private store: Store,
    ){
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
  }

  ngOnInit(): void {
    this.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
    })
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPage = event.urlAfterRedirects.split('/').pop() || '';
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
