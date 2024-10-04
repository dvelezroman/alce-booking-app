import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
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
  screenWidth: number = 0;
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
  noResults: boolean = false;
  selectedUser: UserDto | null = null;
  isEditModalOpen = false;
  editUserForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private stagesService: StagesService,
  ) {
    this.editUserForm = this.fb.group({
      idNumber: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      stageId: ['']
    });
  }

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

    this.screenWidth = window.innerWidth;
  }

//método para calcular el ancho de pantalla para activar las tarjetas y ocultar la tabla
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.screenWidth = (event.target as Window).innerWidth;
  }

  toggleForm() {
    if (!this.isStudentForm) {
      this.userForm.setValue({
        email: '',
        role: ''
      });
    } else {
      this.studentForm.patchValue({
        firstName: '',
        lastName: ''
      });
    }
    this.isStudentForm = !this.isStudentForm;
  }

  searchUsers() {
    this.noResults = false;

    if (this.isStudentForm) {
      const { userId, firstName, lastName, stageId } = this.studentForm.value;
      this.usersService.searchUsers((this.currentPage - 1) * this.itemsPerPage, this.itemsPerPage, undefined, firstName, lastName, undefined, undefined, undefined, stageId)
        .subscribe({
          next: result => {
            this.users = result.users;
            this.totalUsers = result.total; // Update the total count

            if (this.users.length === 0) {
              setTimeout(() => {
                this.noResults = true;
              }, 1000);
            }
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

//método para abrir modal con los datos de usuario
  edit(user: UserDto) {
    this.selectedUser = user;
    this.isEditModalOpen = true;
    this.editUserForm.patchValue({
      idNumber: user.idNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      stageId: user.student?.stage?.id
    });
  }

  updateUser() {
    if (this.editUserForm.valid && this.selectedUser) {
      const updatedUser = { ...this.editUserForm.value };
      this.usersService.update(this.selectedUser.id, updatedUser).subscribe({
        next: (response) => {
          console.log('User updated:', response);
          this.isEditModalOpen = false;
          this.showSuccessModal('Usuario actualizado exitosamente.');
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.showErrorModal('Ocurrió un error al actualizar el usuario.');
        }
      });
    }
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }


  changePage(page: number) {
    this.currentPage = page;
    this.searchUsers(); // Re-fetch the results for the new page
  }

  showSuccessModal(message: string) {
    this.modalIsSuccess = true;
    this.modalIsError = false;
    this.modalMessage = message;
    this.showModal = true;

    setTimeout(() => {
      this.closeModal();
    }, 3000);
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

  protected readonly Math = Math;
}
