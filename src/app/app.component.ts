import { HeaderComponent } from './components/header/header.component';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {SpinnerComponent} from "./components/spinner/spinner.component";
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UsersService } from './services/users.service';
import { CommonModule } from '@angular/common';
import {selectIsLoggedIn} from "./store/user.selector";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SpinnerComponent,
    HeaderComponent,
    SidebarComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  isLoggedIn = false;
  isSidebarClosed = true;

  constructor(private usersService: UsersService, 
              private store: Store,
              private router: Router) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
  }


  ngOnInit() {
    this.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
    })
  }

  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }

  onConfirmLogout() {
    this.usersService.logout();  
    this.router.navigate(['/login']);  
  }
}
