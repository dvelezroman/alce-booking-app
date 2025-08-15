import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { MeetingLinkDto } from '../../../services/dtos/booking.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { UserDto, UserRole, UserStatus } from '../../../services/dtos/user.dto';
import { LinksService } from '../../../services/links.service';
import { StagesService } from '../../../services/stages.service';
import { UsersService } from '../../../services/users.service';
import { ContactDetailsModalComponent } from '../../../components/student/contact-details-modal/contact-details-modal.component';

@Component({
  selector: 'app-searching-students-student',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    FormsModule,
    ContactDetailsModalComponent
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
  itemsPerPage: number = 100;

  stages: Stage[] = [];

  modalConfig: ModalDto = modalInitializer();
  selectedUser: UserDto | null = null;
  isEditModalOpen = false;
  editUserForm!: FormGroup;
  showStageColumn: boolean = true;

  userToDelete: UserDto | null = null;
  isEditPasswordModalOpen = false;
  noResults: boolean = false;

  showContactModal: boolean = false;
  selectedUserForContact: UserDto | null = null;

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
      email: [''],
      birthday: [''],
      status: [false],
      register: [''],
      linkId: [''],
      ageGroup: [''],
      studentId: [''],
      comment: [''],
    });
  }

  ngOnInit() {
    this.stagesService.getAll().subscribe(stages => this.stages = stages);
    this.linksService.getAll().subscribe(links => this.links = links);

    this.studentForm = this.fb.group({
      userId: [''],
      firstName: [''],
      lastName: [''],
      stageId: '',
    });

    this.userForm = this.fb.group({
      email: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.screenWidth = window.innerWidth;
  }

  toggleForm() {
    this.isStudentForm = !this.isStudentForm;
    this.users = [];
    this.totalUsers = 0;
    this.currentPage = 1;
  }

  searchUsers() {
    this.noResults = false;
    const role = this.userForm.value.role;
    this.showStageColumn = !role || role === 'STUDENT';

    if (this.isStudentForm) {
      const { firstName, lastName, stageId } = this.studentForm.value;
      this.usersService.searchUsers((this.currentPage - 1) * this.itemsPerPage, this.itemsPerPage, undefined, firstName, lastName, undefined, UserRole.STUDENT, undefined, stageId)
        .subscribe({
          next: result => {
            this.users = result.users;
            this.totalUsers = result.total;
            if (this.users.length === 0) setTimeout(() => this.noResults = true, 1000);
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
            this.totalUsers = result.total;
          },
          error: error => {
            console.log('Error:', error);
            this.showErrorModal('Error occurred while searching users.');
          }
        });
    }
  }

  openEditPasswordModal(user: UserDto): void {
    this.selectedUser = { ...user };
    this.isEditPasswordModalOpen = true;
    this.selectedUser.password = '';
  }

  updatePassword(): void {
    if (this.selectedUser) {
      const updateData = { password: this.selectedUser.password };
      this.usersService.update(this.selectedUser.id, updateData).subscribe({
        next: () => this.closeEditPasswordModal(),
        error: () => console.error('No se pudo actualizar el password del Link!')
      });
    }
  }

  closeEditPasswordModal(): void {
    this.isEditPasswordModalOpen = false;
    this.selectedUser = null;
  }

  openEditUSerModal(user: UserDto) {
    this.selectedUser = user;
    this.isEditModalOpen = true;
    this.editUserForm.patchValue({
      idNumber: user.idNumber,
      email: user.email,
      birthday: user.birthday,
      register: user.register,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      stageId: user.student?.stage?.id,
      ageGroup: user.student?.studentClassification,
      studentId: user.student?.id,
      linkId: '',
      comment: user.comment,
      status: user.status === UserStatus.ACTIVE,
    });
    if (user.role === UserRole.INSTRUCTOR && user.instructor?.meetingLink?.link) {
      this.editUserForm.patchValue({ linkId: user.instructor.meetingLink.id });
    }
  }

  updateUser() {
    if (this.editUserForm.valid && this.selectedUser) {
      const updatedUser = { ...this.editUserForm.value };
      updatedUser.status = updatedUser.status ? UserStatus.ACTIVE : UserStatus.INACTIVE;
      if (!updatedUser.linkId) delete updatedUser.linkId;
      this.usersService.update(this.selectedUser.id, updatedUser).subscribe({
        next: () => {
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
    this.searchUsers();
  }

  showSuccessModal(message: string) {
    this.modalConfig = {
      show: true,
      message,
      isSuccess: true,
      isError: false,
      isInfo: false,
      showButtons: false,
      close: () => this.modalConfig.show = false
    };
    setTimeout(() => this.modalConfig.show = false, 3000);
  }

  showErrorModal(message: string) {
    this.modalConfig = {
      show: true,
      message,
      isSuccess: false,
      isError: true,
      isInfo: false,
      showButtons: false,
      close: () => this.modalConfig.show = false
    };
    setTimeout(() => this.modalConfig.show = false, 3000);
  }

  // MODAL ELIMINACIÓN
  openDeleteModal(user: UserDto): void {
    this.userToDelete = user;
    this.modalConfig = {
      show: true,
      message: `¿Estás seguro de que deseas eliminar al usuario ${user.firstName} ${user.lastName}?`,
      isError: false,
      isSuccess: false,
      isInfo: true,
      showButtons: true,
      close: () => this.modalConfig.show = false,
      confirm: () => this.confirmDelete()
    };
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.usersService.delete(this.userToDelete.id).subscribe({
        next: () => {
          this.showSuccessModal('Usuario eliminado exitosamente');
          this.searchUsers();
        },
        error: (error) => {
          console.error('Error al eliminar el usuario:', error);
          this.showErrorModal('No se pudo eliminar el usuario');
        }
      });
    }
  }

  openContactModal(user: UserDto) {
    this.selectedUserForContact = user;
    this.showContactModal = true;
  }

  closeContactModal() {
    this.showContactModal = false;
    this.selectedUserForContact = null;
  }

  protected readonly Math = Math;
  protected readonly UserRole = UserRole;
  protected readonly UserStatus = UserStatus;
}