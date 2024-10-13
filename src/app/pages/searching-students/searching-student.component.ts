import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import {UsersService} from "../../services/users.service";
import {UserDto, UserRole} from "../../services/dtos/user.dto";
import {Stage} from "../../services/dtos/student.dto";
import {StagesService} from "../../services/stages.service";
import {MeetingLinkDto} from "../../services/dtos/booking.dto";
import {LinksService} from "../../services/links.service";

@Component({
  selector: 'app-searching-students-student',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      ModalComponent,
      FormsModule
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
  ageGroupOptions: string[] = ['KIDS', 'TEENS', 'ADULTS'];
  links: MeetingLinkDto[] = [];

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
  showStageColumn: boolean = true;

  isDeleteModalOpen: boolean = false;
  deleteModalMessage: string = '';
  userToDelete: UserDto | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private stagesService: StagesService,
    private linksService: LinksService,
  ) {
    this.editUserForm = this.fb.group({
       idNumber: [{ value: '', disabled: true }, Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: [{ value: '' }, Validators.required],
      stageId: [''],
      email: ['', Validators.email],
      birthday: ['', Validators.required],
      status: ['', Validators.required],
      register: ['', Validators.required],
      linkId: [''],
      ageGroup: [''],
      studentId: [''],
    });
  }

  ngOnInit() {
    this.stagesService.getAll().subscribe(stages => {
      this.stages = stages;
    });
    this.linksService.getAll().subscribe(links => {
      this.links = links;
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

    const role = this.userForm.value.role;
    this.showStageColumn = !role || role === 'STUDENT';

    if (this.isStudentForm) {
      const { firstName, lastName, stageId } = this.studentForm.value;
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
      email: user.email,
      birthday: user.birthday,
      status: user.status,
      register: user.register,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      stageId: user.student?.stage?.id,
      ageGroup: user.student?.studentClassification,
      studentId: user.student?.id,
    });
    if (user.role === UserRole.INSTRUCTOR && user.instructor?.meetingLink?.link) {
      this.editUserForm.patchValue({ linkId: user.instructor.meetingLink.id });
    }
  }

  updateUser() {
    if (this.editUserForm.valid && this.selectedUser) {
      const updatedUser = { ...this.editUserForm.value };
      if (!updatedUser.linkId) {
        delete updatedUser.linkId;
      }
      this.usersService.update(this.selectedUser.id, updatedUser).subscribe({
        next: () => {
          // console.log('User updated:', response);
          this.isEditModalOpen = false;
          this.showSuccessModal('Usuario actualizado exitosamente.');
          this.searchUsers();
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
  protected readonly UserRole = UserRole;

// Abre el modal de eliminación
openDeleteModal(user: UserDto): void {
  // this.deleteModalMessage = `¿Estás seguro de que deseas eliminar al usuario ${user.firstName} ${user.lastName}?`;
  // this.isDeleteModalOpen = true;
  // this.userToDelete = user;
}

// Cierra el modal de eliminación
closeDeleteModal(): void {
  this.isDeleteModalOpen = false;
  this.userToDelete = null;
}

// Confirma y elimina el usuario
confirmDelete(): void {
  if (this.userToDelete) {
    // console.log("Eliminando usuario con ID:", this.userToDelete.id);
    this.usersService.delete(this.userToDelete.id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== this.userToDelete?.id);
        this.showSuccessModal('Usuario eliminado exitosamente');
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error al eliminar el usuario:', error);
        this.showErrorModal('No se pudo eliminar el usuario');
        this.closeDeleteModal();
      }
    });
  }
}

}

