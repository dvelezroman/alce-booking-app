import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { UserDto, UserRole } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit, OnChanges {

  @Input() userData: UserDto | null = null;
  @Input() isLoggedIn = false;

  adminName = '';

  ngOnInit(): void {
    this.resolveAdmin();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData']) {
      this.resolveAdmin();
    }
  }

  private resolveAdmin(): void {
    if (!this.userData) return;
    if (this.userData.role !== UserRole.ADMIN) return;

    this.adminName = this.userData.firstName ?? 'Administrador';
  }
}