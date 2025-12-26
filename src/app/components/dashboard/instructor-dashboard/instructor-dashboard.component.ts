import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { UserDto, UserRole } from '../../../services/dtos/user.dto';

import {
  InstructorCalendarComponent
} from '../../../components/home/instructor-calendar/instructor-calendar.component';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    InstructorCalendarComponent,
  ],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.scss',
})
export class InstructorDashboardComponent implements OnInit, OnChanges {

  @Input() userData: UserDto | null = null;
  @Input() isLoggedIn = false;

  instructorId: number | null = null;

  ngOnInit(): void {
    // respaldo por si ya viene cargado
    this.resolveInstructor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData']) {
      this.resolveInstructor();
    }
  }

  private resolveInstructor(): void {
    if (!this.userData) return;
    if (this.userData.role !== UserRole.INSTRUCTOR) return;
    if (!this.userData.instructor) return;

    this.instructorId = this.userData.instructor.id;
  }
}