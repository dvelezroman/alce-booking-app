
import { HeaderComponent } from './components/header/header.component';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UsersService } from './services/users.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isSidebarClosed = true; 

  constructor(private usersService: UsersService) {}


  ngOnInit() {

    this.usersService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn; 
    });
  }

  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed; 
  }
}
