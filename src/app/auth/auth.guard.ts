import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {UsersService} from "../services/users.service";


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UsersService, private router: Router) {}

  canActivate(): boolean {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

    if (accessToken) {
      return true
    } else {
      this.router.navigate(['/home']); // Redirect to home if no token
      return false;
    }
  }
}
