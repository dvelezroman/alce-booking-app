import { Component, OnInit } from '@angular/core';
import { StagesService } from '../../services/stages.service';
import { CommonModule } from '@angular/common';
import { Stage } from '../../services/dtos/student.dto';
import { FormsModule} from '@angular/forms';
import { UserDto } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-reports-detailed',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule
  ],
  templateUrl: './reports-detailed.component.html',
  styleUrl: './reports-detailed.component.scss'
})
export class ReportsDetailedComponent implements OnInit {
  filter = {
    studentName: '',
    from: '',
    to: '',
    stageId: ''
  };
  stages: any[] = [];
  students: UserDto[] = [];
  filteredStudents: UserDto[] = [];
  showDropdown: boolean = false;
  selectedStudentId: number | undefined;
  selectedStudentName: string = '';

  constructor(private stagesService: StagesService, 
              private usersService: UsersService) {}

  ngOnInit() {
    this.stagesService.getAll().subscribe(stages => {
      this.stages = stages;
    });
    this.loadStudents();
  }

  loadStudents() {
    this.usersService.searchUsers(0, undefined, undefined, undefined, undefined, undefined, 'STUDENT')
      .subscribe({
        next: (result) => {
          this.students = result.users;
        },
        error: (error) => {
          console.error('Error al cargar estudiantes:', error);
        }
      });
  }

  filterStudents() {
    const query = this.filter.studentName.trim().toLowerCase();

    if (query.length > 0 && query !== this.selectedStudentName?.toLowerCase()) {
      this.filteredStudents = this.students.filter(student =>
        (student.firstName + ' ' + student.lastName).toLowerCase().includes(query)
      );
      this.showDropdown = true;
    } else {
      this.filteredStudents = [];
      this.showDropdown = false;
    }
  }

  selectStudent(user: UserDto) {
    this.filter.studentName = `${user.firstName} ${user.lastName}`;
    this.selectedStudentId = user.student?.id;
    this.selectedStudentName = this.filter.studentName;
    this.showDropdown = false;
  }

  hideDropdown() {
    setTimeout(() => (this.showDropdown = false), 200);
  }
}
