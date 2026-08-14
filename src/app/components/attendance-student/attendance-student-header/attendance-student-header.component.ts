import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-attendance-student-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-student-header.component.html',
  styleUrl: './attendance-student-header.component.scss',
})
export class AttendanceStudentHeaderComponent {}