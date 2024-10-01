import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-searching-student',
  standalone: true,
  imports: [
      CommonModule
  ],
  templateUrl: './searching-student.component.html',
  styleUrl: './searching-student.component.scss'
})
export class SearchingStudentComponent {
  isStudentForm = true;

  toggleForm() {
    this.isStudentForm = !this.isStudentForm;
  }
}
