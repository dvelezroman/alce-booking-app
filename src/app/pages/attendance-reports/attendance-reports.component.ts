import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserDto } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-attendance-reports',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule
  ],
  templateUrl: './attendance-reports.component.html',
  styleUrl: './attendance-reports.component.scss'
})
export class AttendanceReportsComponent implements OnInit {
  availableHours: number[] = [];
  students: UserDto[] = [];
  filteredStudents: UserDto[] = [];
  filter = {
    studentName: '',
    from: '',
    to: '',
    hour: ''
  };
  
  showDropdown: boolean = false;
  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.availableHours = Array.from({ length: 13 }, (_, i) => 9 + i);
    this.loadStudents();
    this.filteredStudents = [...this.students];
    
  }

  filterStudents() {
    const query = this.filter.studentName.trim();
    if (query.length > 0) {
      this.filteredStudents = this.students.filter(student =>
        (student.firstName + ' ' + student.lastName).toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.filteredStudents = [];
    }
  }

  selectStudent(student: UserDto) {
    this.filter.studentName = `${student.firstName} ${student.lastName}`;
    this.showDropdown = false;
  }

  hideDropdown() {
    setTimeout(() => (this.showDropdown = false), 200);
  }

  loadStudents() {
    this.usersService.searchUsers(1, 100, undefined, undefined, undefined, undefined, 'STUDENT')
      .subscribe({
        next: (result) => {
          this.students = result.users; 
          console.log('Estudiantes cargados:', this.students); 
        },
        error: (error) => {
          console.error('Error al cargar estudiantes:', error);
        }
      });
  }

  onFilterChange() {
  }

  searchAttendance() {
    console.log("busqueda:", this.filter);
  }
}
