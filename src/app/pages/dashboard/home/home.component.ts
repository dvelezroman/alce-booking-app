import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

import { selectIsLoggedIn, selectUserData } from '../../../store/user.selector';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';

/* DASHBOARDS */
import { StudentDashboardComponent } from '../../../components/dashboard/student-dashboard/student-dashboard.component';
import { InstructorDashboardComponent } from '../../../components/dashboard/instructor-dashboard/instructor-dashboard.component';
import { AdminDashboardComponent } from '../../../components/dashboard/admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-home-private',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ModalComponent,

    /* Dashboards */
    StudentDashboardComponent,
    InstructorDashboardComponent,
    AdminDashboardComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomePrivateComponent implements OnInit {
  modal: ModalDto = modalInitializer();

  isLoggedIn$: Observable<boolean>;
  userData$: Observable<UserDto | null>;

  isStudent = false;
  isInstructor = false;
  isAdmin = false;

  constructor(private store: Store) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit(): void {
    this.userData$.subscribe((user) => {
      this.isStudent = user?.role === UserRole.STUDENT;
      this.isInstructor = user?.role === UserRole.INSTRUCTOR;
      this.isAdmin = user?.role === UserRole.ADMIN;
    });
  }

  /* Modal helpers */
  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => this.modal.close(), 2500);
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  };
}