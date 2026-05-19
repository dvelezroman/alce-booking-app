import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { normalizeWhatsappPhone } from '../../../shared/utils/whatsapp-phone.util';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.scss'],
})
export class UserSelectorComponent implements OnChanges {
  @Input() role: 'student' | 'instructor' | 'admin' | undefined;
  @Input() stageId: number | undefined;
  @Input() reset = false;
  @Input() maxSelectable: number | null = null;
  @Input() resetTrigger = 0;
  /** Si true, solo permite seleccionar usuarios con teléfono en `contact`. */
  @Input() requireValidPhone = false;
  /** `modern`: tarjetas, chips y búsqueda estilizada (p. ej. WhatsApp). */
  @Input() theme: 'legacy' | 'modern' = 'legacy';
  /** Precarga estudiantes al enfocar el buscador (útil sin filtro de stage). */
  @Input() preloadStudentsOnFocus = false;

  @Output() usersSelected = new EventEmitter<UserDto[]>();

  @ViewChild('containerRef') containerRef!: ElementRef;
  private readonly DEFAULT_PAGE = 0;
  private readonly DEFAULT_LIMIT = 500;

  searchTerm: string = '';
  searchInput$ = new Subject<string>();
  allUsers: UserDto[] = [];
  selectedUsers: UserDto[] = [];

  isDropdownOpen = false;

  private fetchSeq = 0;

  constructor(private usersService: UsersService) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe((term) => this.fetchUsers(term));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTrigger'] && !changes['resetTrigger'].firstChange) {
      this.clearSelection();
    }

    if (changes['role'] && !changes['role'].firstChange) {
      this.searchTerm = '';
      this.allUsers = [];
      this.selectedUsers = [];
      this.usersSelected.emit([]);
      this.isDropdownOpen = false;

      this.fetchSeq++;
    }

    if (
      this.role === 'student' &&
      changes['stageId'] &&
      changes['stageId'].currentValue !== changes['stageId'].previousValue
    ) {
      this.fetchUsers('');
    }
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }

  fetchUsers(term: string): void {
    if (!this.role) {
      this.allUsers = [];
      this.isDropdownOpen = false;
      return;
    }

    const isStudentWithStage = this.role === 'student' && this.stageId;
    const shouldFetch =
      term.trim().length >= 2 ||
      (this.role === 'student' && !!this.stageId) ||
      (this.role === 'student' && this.preloadStudentsOnFocus) ||
      this.role === 'instructor' ||
      this.role === 'admin';

    if (!shouldFetch) {
      this.allUsers = [];
      this.isDropdownOpen = false;
      return;
    }

    const seq = ++this.fetchSeq;
    const expectedRole = this.role;
    const expectedStage = this.stageId;

    this.usersService
      .searchUsers(
        this.DEFAULT_PAGE,
        this.DEFAULT_LIMIT,
        undefined,
        term,
        term,
        undefined,
        this.role?.toUpperCase(),
        true,
        isStudentWithStage ? this.stageId : undefined
      )
      .subscribe({
        next: (res) => {
          if (seq !== this.fetchSeq) return;
          if (this.role !== expectedRole) return;
          if (expectedRole === 'student' && this.stageId !== expectedStage) return;

          this.allUsers = res.users;
          this.isDropdownOpen = true;
        },
        error: () => {
          this.allUsers = [];
          this.isDropdownOpen = false;
        },
      });
  }

  toggleUserSelection(user: UserDto): void {
    const exists = this.selectedUsers.find((u) => u.id === user.id);

    if (exists) {
      this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
    } else {
      if (this.requireValidPhone && !normalizeWhatsappPhone(user.contact)) {
        return;
      }
      if (this.maxSelectable === 1) {
        this.selectedUsers = [user];
      } else if (!this.maxSelectable || this.selectedUsers.length < this.maxSelectable) {
        this.selectedUsers.push(user);
      }
    }

    this.usersSelected.emit(this.selectedUsers);
  }

  formatUserPhone(user: UserDto): string {
    const normalized = normalizeWhatsappPhone(user.contact);
    if (normalized) {
      return normalized;
    }
    if (user.contact?.trim()) {
      return `${user.contact} (inválido)`;
    }
    return 'Sin teléfono';
  }

  hasValidPhone(user: UserDto): boolean {
    return Boolean(normalizeWhatsappPhone(user.contact));
  }

  isSelected(user: UserDto): boolean {
    return this.selectedUsers.some((u) => u.id === user.id);
  }

  clearSelection(): void {
    this.selectedUsers = [];
    this.searchTerm = '';
    this.allUsers = [];
    this.usersSelected.emit([]);
    this.isDropdownOpen = false;
  }

  get roleLabel(): string {
    switch (this.role) {
      case 'student':
        return 'Estudiantes';
      case 'instructor':
        return 'Instructores';
      case 'admin':
        return 'Administradores';
      default:
        return 'Usuarios';
    }
  }

  get searchPlaceholder(): string {
    if (this.theme === 'modern') {
      return 'Buscar por nombre o apellido…';
    }
    return 'Buscar usuario por nombre';
  }

  get searchHint(): string | null {
    if (this.theme !== 'modern') {
      return null;
    }
    if (this.role === 'student' && !this.preloadStudentsOnFocus && !this.stageId) {
      return 'Escribe al menos 2 caracteres para ver resultados.';
    }
    if (this.requireValidPhone) {
      return 'Solo se pueden seleccionar perfiles con teléfono válido.';
    }
    return null;
  }

  getInitials(user: UserDto): string {
    const first = user.firstName?.trim()?.[0] ?? '';
    const last = user.lastName?.trim()?.[0] ?? '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || '?';
  }

  onInputFocus(): void {
    const shouldPreload =
      (this.role === 'student' && this.stageId) ||
      (this.role === 'student' && this.preloadStudentsOnFocus) ||
      this.role === 'instructor' ||
      this.role === 'admin';

    if (shouldPreload && this.allUsers.length === 0) {
      this.fetchUsers('');
    }

    this.isDropdownOpen = true;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.containerRef?.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  removeUser(user: UserDto): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
    this.usersSelected.emit(this.selectedUsers);
  }
}