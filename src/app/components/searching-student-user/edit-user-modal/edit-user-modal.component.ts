import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserDto, UserRole, UserStatus } from '../../../services/dtos/user.dto';
import { MeetingLinkDto } from '../../../services/dtos/booking.dto';
import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user-modal.component.html',
  styleUrl: './edit-user-modal.component.scss'
})
export class EditUserModalComponent {
  @Input() showModal = false;
  @Input() user: UserDto | null = null;
  @Input() stages: Stage[] = [];
  @Input() links: MeetingLinkDto[] = [];
  @Input() roles: string[] = [];
  @Input() ageGroupOptions: string[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  form!: FormGroup;
  isMinor = false;
  protected readonly UserRole = UserRole;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges() {
    if (this.user) this.patchForm(this.user);
  }

  /** Inicializa formulario */
  private initForm() {
    this.form = this.fb.group({
      idNumber: [{ value: '', disabled: true }, Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      stageId: [''],
      email: [''],
      emailAddress: [''],
      contact: [''],
      birthday: [''],
      tutorName: [''],
      tutorEmail: [''],
      tutorPhone: [''],
      occupation: [''],
      status: [false],
      register: [''],
      linkId: [''],
      ageGroup: [''],
      studentId: [''],
      comment: [''],
      temporaryComment: [''],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }],
      startClassDate: [''],
      endClassDate: [''],
    });

    // Detectar si es menor de edad
    this.form.get('birthday')?.valueChanges.subscribe((value) => this.checkIfMinor(value));
  }

  /** Pasa los valores del usuario al formulario */
  private patchForm(user: UserDto) {
    this.form.patchValue({
      idNumber: user.idNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailAddress: user.emailAddress,
      contact: user.contact,
      country: user.country,
      city: user.city,
      role: user.role,
      occupation: user.occupation,
      birthday: user.birthday ? this.formatLocalDate(user.birthday) : '',
      status: user.status === UserStatus.ACTIVE,
      comment: user.comment,
      temporaryComment: user.temporaryComment,
      stageId: user.student?.stage?.id || '',
      ageGroup: user.student?.studentClassification || '',
      studentId: user.student?.id || '',
      startClassDate: user.student?.startClassDate ? new Date(user.student.startClassDate).toISOString().split('T')[0] : '',
      endClassDate: user.student?.endClassDate ? new Date(user.student.endClassDate).toISOString().split('T')[0] : '',
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : '',
      linkId: user.instructor?.meetingLink?.id || '',
      tutorName: user.student?.tutorName || (user as any).tutorName || '',
      tutorEmail: user.student?.tutorEmail || (user as any).tutorEmail || '',
      tutorPhone: user.student?.tutorPhone || (user as any).tutorPhone || '',
    });

    if (user.birthday) this.checkIfMinor(user.birthday);
  }

  /** Convierte fecha a formato local YYYY-MM-DD */
  private formatLocalDate(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /** Verifica si es menor de edad */
  private checkIfMinor(birthday: string): void {
    if (!birthday) {
      this.isMinor = false;
      return;
    }

    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;

    this.isMinor = age < 18;
  }

  /** Envía datos al backend */
  onSubmit() {
    if (this.form.invalid) return;

    const updated = { ...this.form.getRawValue() };
    updated.status = updated.status ? UserStatus.ACTIVE : UserStatus.INACTIVE;

    if (!updated.linkId) delete updated.linkId;

    this.save.emit(updated);
  }

  /** Cierra modal */
  onClose() {
    this.close.emit();
  }
}