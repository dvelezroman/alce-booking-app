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
  protected readonly UserRole = UserRole;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges() {
    if (this.user) {
      this.patchForm(this.user);
    }
  }

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
  }

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
      status: user.status === UserStatus.ACTIVE,
      comment: user.comment,
      temporaryComment: user.temporaryComment,
      stageId: user.student?.stage?.id || '',
      ageGroup: user.student?.studentClassification || '',
      studentId: user.student?.id || '',
      startClassDate: user.student?.startClassDate
        ? new Date(user.student.startClassDate).toISOString().split('T')[0]
        : '',
      endClassDate: user.student?.endClassDate
        ? new Date(user.student.endClassDate).toISOString().split('T')[0]
        : '',
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : '',
      linkId: user.instructor?.meetingLink?.id || ''
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const updated = { ...this.form.getRawValue() };
      updated.status = updated.status ? UserStatus.ACTIVE : UserStatus.INACTIVE;
      // Si no hay link, eliminar del payload
      if (!updated.linkId) delete updated.linkId;

      this.save.emit(updated);
    }
  }

  onClose() {
    this.close.emit();
  }
}