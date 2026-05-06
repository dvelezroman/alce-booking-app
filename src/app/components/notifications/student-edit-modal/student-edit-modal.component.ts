import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewStudentRow } from '../../../services/dtos/notification.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { StagesService } from '../../../services/stages.service';
import { Instructor } from '../../../services/dtos/instructor.dto';
import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-student-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-edit-modal.component.html',
  styleUrls: ['./student-edit-modal.component.scss'],
})
export class StudentEditModalComponent implements OnChanges{
  @Input() show = false;
  @Input() student: NewStudentRow | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NewStudentRow>();

  @Input() stages: Stage[] = [];
  @Input() instructors: UserDto[] = [];

  form: FormGroup;

  constructor(private fb: FormBuilder, private stagesService: StagesService,) {
    this.form = this.fb.group({
      index: [null],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      idNumber: ['', Validators.required],
      city: ['', Validators.required],
      mode: ['', Validators.required],
      stageId: [null, Validators.required],
      stageLabel: ['', Validators.required],
      startClassDate: ['', Validators.required],
      studentClassification: ['', Validators.required],
      tutorName: [''],
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['student'] || changes['stages']) && this.student) {
      const stage = this.stages.find(
        (s) => Number(s.id) === Number(this.student?.stageId)
      );

      this.form.patchValue({
        ...this.student,
        stageId: stage ? stage.id : this.student.stageId,
        stageLabel: stage
          ? `STG ${stage.number} — ${stage.description || `Stage ${stage.number}`}`
          : this.student.stageLabel,
        tutorName: this.student.tutorName === '—' ? '' : this.student.tutorName,
        startClassDate: this.formatDateForInput(this.student.startClassDate),
      });
    }
  }

  getInstructorName(instructor: UserDto): string {
    return (
      [instructor.firstName, instructor.lastName].filter(Boolean).join(' ').trim() ||
      instructor.email ||
      `Instructor ${instructor.id}`
    );
  }

  onStageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);

    const stage = this.stages.find((s) => Number(s.id) === id);

    this.form.patchValue({
      stageId: id,
      stageLabel: stage
        ? `STG ${stage.number} — ${stage.description || `Stage ${stage.number}`}`
        : '',
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid || !this.student) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    this.save.emit({
      ...this.student,
      ...value,
      startClassDate: new Date(value.startClassDate).toISOString(),
    });
  }

  private formatDateForInput(date?: string): string {
    if (!date) return '';

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';

    return parsed.toISOString().split('T')[0];
  }
}