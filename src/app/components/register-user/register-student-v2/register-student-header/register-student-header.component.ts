import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register-student-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './register-student-header.component.html',
  styleUrl: './register-student-header.component.scss',
})
export class RegisterStudentHeaderComponent {}