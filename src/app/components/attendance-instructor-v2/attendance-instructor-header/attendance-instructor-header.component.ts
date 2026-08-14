import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-attendance-instructor-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-instructor-header.component.html',
  styleUrl: './attendance-instructor-header.component.scss',
})
export class AttendanceInstructorHeaderComponent {}