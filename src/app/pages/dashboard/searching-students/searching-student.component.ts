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
import { EditUserModalComponent } from '../../../components/searching-student-user/edit-user-modal/edit-user-modal.component';

@Component({
  selector: 'app-searching-students-student',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalComponent,
    ContactDetailsModalComponent,
    EditUserModalComponent,
  ],
  templateUrl: './searching-student.component.html',
  styleUrls: ['./searching-student.component.scss'],
})
export class SearchingStudentComponent {
  // --- Variables principales ---
  screenWidth: number = 0;
  isStudentForm = true;
  studentForm!: FormGroup;
  userForm!: FormGroup;
  roles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
  ageGroupOptions: string[] = ['KIDS', 'TEENS', 'ADULTS'];
  links: MeetingLinkDto[] = [];
  stages: Stage[] = [];

  users: UserDto[] = [];
  totalUsers: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 100;
  showStageColumn: boolean = true;
  noResults: boolean = false;

  // --- Modales ---
  modalConfig: ModalDto = modalInitializer();
  selectedUser: UserDto | null = null;
  isEditModalOpen = false;

  isEditPasswordModalOpen = false;
  userToDelete: UserDto | null = null;

  showContactModal: boolean = false;
  selectedUserForContact: UserDto | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private stagesService: StagesService,
    private linksService: LinksService
  ) {}

  ngOnInit() {
    this.stagesService.getAll().subscribe((stages) => (this.stages = stages));
    this.linksService.getAll().subscribe((links) => (this.links = links));

    // Formularios de búsqueda
    this.studentForm = this.fb.group({
      userId: [''],
      firstName: [''],
      lastName: [''],
      stageId: '',
    });

    this.userForm = this.fb.group({
      email: ['', Validators.required],
      role: ['', Validators.required],
    });

    this.screenWidth = window.innerWidth;
  }

  // --- Búsqueda ---
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
      this.usersService
        .searchUsers(
          (this.currentPage - 1) * this.itemsPerPage,
          this.itemsPerPage,
          undefined,
          firstName,
          lastName,
          undefined,
          UserRole.STUDENT,
          undefined,
          stageId
        )
        .subscribe({
          next: (result) => {
            this.users = result.users;
            this.totalUsers = result.total;
            if (this.users.length === 0) setTimeout(() => (this.noResults = true), 1000);
          },
          error: (error) => {
            console.log('Error:', error);
            this.showErrorModal('Error occurred while searching users.');
          },
        });
    } else {
      const { email, role } = this.userForm.value;
      this.usersService
        .searchUsers(
          (this.currentPage - 1) * this.itemsPerPage,
          this.itemsPerPage,
          email,
          undefined,
          undefined,
          undefined,
          role,
          undefined
        )
        .subscribe({
          next: (result) => {
            this.users = result.users;
            this.totalUsers = result.total;
          },
          error: (error) => {
            console.log('Error:', error);
            this.showErrorModal('Error occurred while searching users.');
          },
        });
    }
  }

  // --- MODAL: Editar usuario ---
  openEditUserModal(user: UserDto) {
    this.selectedUser = user;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedUser = null;
  }

  updateUserFromChild(payload: any) {
    if (this.selectedUser) {
      this.usersService.update(this.selectedUser.id, payload).subscribe({
        next: () => {
          // Actualiza en memoria (sin esperar al backend)
          const index = this.users.findIndex(u => u.id === this.selectedUser?.id);
          if (index !== -1) {
            this.users[index] = {
              ...this.users[index],
              ...payload
            };
          }

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

  // --- MODAL: Password ---
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
        error: () => console.error('No se pudo actualizar el password del Link!'),
      });
    }
  }

  closeEditPasswordModal(): void {
    this.isEditPasswordModalOpen = false;
    this.selectedUser = null;
  }

  // --- MODAL: Contacto ---
  openContactModal(user: UserDto) {
    this.selectedUserForContact = user;
    this.showContactModal = true;
  }

  closeContactModal() {
    this.showContactModal = false;
    this.selectedUserForContact = null;
  }

  // --- MODAL: Eliminación ---
  openDeleteModal(user: UserDto): void {
    this.userToDelete = user;
    this.modalConfig = {
      show: true,
      message: `¿Estás seguro de que deseas eliminar al usuario ${user.firstName} ${user.lastName}?`,
      isError: false,
      isSuccess: false,
      isInfo: true,
      showButtons: true,
      close: () => (this.modalConfig.show = false),
      confirm: () => this.confirmDelete(),
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
        },
      });
    }
  }

  // --- Paginación ---
  changePage(page: number) {
    this.currentPage = page;
    this.searchUsers();
  }

  // --- Modales de mensajes ---
  showSuccessModal(message: string) {
    this.modalConfig = {
      show: true,
      message,
      isSuccess: true,
      isError: false,
      isInfo: false,
      showButtons: false,
      close: () => (this.modalConfig.show = false),
    };
    setTimeout(() => (this.modalConfig.show = false), 3000);
  }

  showErrorModal(message: string) {
    this.modalConfig = {
      show: true,
      message,
      isSuccess: false,
      isError: true,
      isInfo: false,
      showButtons: false,
      close: () => (this.modalConfig.show = false),
    };
    setTimeout(() => (this.modalConfig.show = false), 3000);
  }

  // --- Helpers ---
  getStartClassDate(user: UserDto): string {
    const date = user?.student?.startClassDate;
    return date ? new Date(date).toISOString().split('T')[0] : '';
  }

  getEndClassDate(user: UserDto): string {
    const date = user?.student?.endClassDate;
    return date ? new Date(date).toISOString().split('T')[0] : '';
  }

  getCreatedAt(user: UserDto): string {
    const date = user?.createdAt;
    return date ? new Date(date).toISOString().split('T')[0] : '';
  }

  protected readonly Math = Math;
  protected readonly UserRole = UserRole;
  protected readonly UserStatus = UserStatus;
}
