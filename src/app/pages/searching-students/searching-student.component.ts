import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import {UsersService} from "../../services/users.service";
import {UserDto} from "../../services/dtos/user.dto";
import {Stage} from "../../services/dtos/student.dto";
import {StagesService} from "../../services/stages.service";

@Component({
  selector: 'app-searching-students-student',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      ModalComponent
  ],
  templateUrl: './searching-student.component.html',
  styleUrl: './searching-student.component.scss'
})
export class SearchingStudentComponent {
  isStudentForm = true;
  studentForm!: FormGroup;
  userForm!: FormGroup;
  roles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

  users: UserDto[] = [];
  totalUsers: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10; // Set the number of items per page

  stages: Stage[] = [];

  showModal: boolean = false;
  modalMessage: string = '';
  modalIsError: boolean = false;
  modalIsSuccess: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private stagesService: StagesService,
  ) {}

  ngOnInit() {
    this.stagesService.getAll().subscribe(stages => {
      this.stages = stages;
    });
    this.studentForm = this.fb.group({
      userId: [''],
      firstName: [''],
      lastName: [''],
      stageId: 1,
    });

    this.userForm = this.fb.group({
      email: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  toggleForm() {
    if (this.isStudentForm) {
      this.userForm.reset();
    } else {
      this.studentForm.reset();
    }
    this.isStudentForm = !this.isStudentForm;
  }

  searchUsers() {
    if (this.isStudentForm) {
      const { userId, firstName, lastName, stageId } = this.studentForm.value;
      this.usersService.searchUsers((this.currentPage - 1) * this.itemsPerPage, this.itemsPerPage, undefined, firstName, lastName, undefined, undefined, undefined, stageId)
        .subscribe({
          next: result => {
            this.users = result.users;
            this.totalUsers = result.total; // Update the total count
          },
          error: error => {
            console.log('Error:', error);
            this.showErrorModal('Error occurred while searching users.');
                    }
      });
    } else {
      const { email, role } = this.userForm.value;

      this.usersService.searchUsers((this.currentPage - 1) * this.itemsPerPage, this.itemsPerPage, email, undefined, undefined, undefined, role, undefined)
        .subscribe({
          next: result => {
            this.users = result.users;
            this.totalUsers = result.total; // Update the total count
          },
          error: error => {
            console.log('Error:', error);
            this.showErrorModal('Error occurred while searching users.');
          }
        });
    }
  }

  changePage(page: number) {
    this.currentPage = page;
    this.searchUsers(); // Re-fetch the results for the new page
  }

  showErrorModal(message: string) {
    this.modalIsSuccess = false;
    this.modalIsError = true;
    this.modalMessage = message;
    this.showModal = true;

    setTimeout(() => {
      this.closeModal();
    }, 3000);
  }

  closeModal() {
    this.showModal = false;
  }

}
