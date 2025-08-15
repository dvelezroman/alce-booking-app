import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserDto, UserRole } from '../../services/dtos/user.dto';
import { selectUserData } from '../../store/user.selector';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-global-notice-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-notice-banner.component.html',
  styleUrl: './global-notice-banner.component.scss',
})
export class GlobalNoticeBannerComponent implements OnInit {
  isVisible = false;
  userData$: Observable<UserDto | null>;

  constructor(private store: Store) {
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit(): void {
    const dismissed = localStorage.getItem('globalNoticeDismissed');

    this.userData$.subscribe(user => {
      const isStudent = user?.role === UserRole.STUDENT;
      this.isVisible = isStudent && dismissed !== 'true';
    });
  }

  dismiss(): void {
    this.isVisible = false;
    localStorage.setItem('globalNoticeDismissed', 'true');
  }
}