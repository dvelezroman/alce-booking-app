import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import { StudentsService } from '../../../services/students.service';
import {
  AssignPlatformAssessmentsResult,
  RemoteTemplateItem,
} from '../../../services/dtos/platform-assessment.dto';
import { Student } from '../../../services/dtos/student.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

type SelectedStudent = {
  studentId: number;
  name: string;
  email?: string;
  stageNumber?: string;
};

@Component({
  selector: 'app-platform-assessments-assign',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  templateUrl: './platform-assessments-assign.component.html',
  styleUrls: ['./platform-assessments-assign.component.scss'],
})
export class PlatformAssessmentsAssignComponent implements OnInit {
  templates: RemoteTemplateItem[] = [];
  templatesLoading = false;
  templateSearch = '';
  selectedTemplateId = '';

  idNumberSearch = '';
  studentIdSearch = '';
  selected: SelectedStudent[] = [];

  expiresLocal = '';
  maxAttempts = 1;

  submitting = false;
  lastResult: AssignPlatformAssessmentsResult | null = null;
  errorMessage = '';
  modal: ModalDto = modalInitializer();

  constructor(
    private platformAssessmentService: PlatformAssessmentService,
    private studentsService: StudentsService,
  ) {}

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    tomorrow.setMinutes(0, 0, 0);
    this.expiresLocal = this.toLocalInput(tomorrow);
    this.loadTemplates();
  }

  get selectedTemplate(): RemoteTemplateItem | null {
    return this.templates.find((t) => t.id === this.selectedTemplateId) ?? null;
  }

  loadTemplates(): void {
    this.templatesLoading = true;
    this.platformAssessmentService
      .getTemplates({
        page: 1,
        pageSize: 50,
        search: this.templateSearch.trim() || undefined,
        isActive: true,
      })
      .subscribe({
        next: (res) => {
          this.templates = res.data ?? [];
          this.templatesLoading = false;
          if (
            this.selectedTemplateId &&
            !this.templates.some((t) => t.id === this.selectedTemplateId)
          ) {
            this.selectedTemplateId = '';
          }
        },
        error: (err) => {
          this.templates = [];
          this.templatesLoading = false;
          this.errorMessage =
            err?.error?.message ||
            err?.message ||
            'No se pudieron cargar los templates.';
        },
      });
  }

  addByIdNumber(): void {
    const idNumber = this.idNumberSearch.trim();
    if (!idNumber) return;
    this.studentsService.findStudents({ idNumber }).subscribe({
      next: (list) => {
        if (!list?.length) {
          this.flashError(`No hay estudiante con cédula ${idNumber}.`);
          return;
        }
        this.addStudent(list[0]);
        this.idNumberSearch = '';
      },
      error: () => this.flashError('Error buscando por cédula.'),
    });
  }

  addByStudentId(): void {
    const id = Number(this.studentIdSearch);
    if (!Number.isInteger(id) || id < 1) {
      this.flashError('Student ID inválido.');
      return;
    }
    this.studentsService.findStudentById(id).subscribe({
      next: (student) => {
        this.addStudent(student);
        this.studentIdSearch = '';
      },
      error: () => this.flashError(`No se encontró studentId ${id}.`),
    });
  }

  removeStudent(studentId: number): void {
    this.selected = this.selected.filter((s) => s.studentId !== studentId);
  }

  submit(): void {
    this.errorMessage = '';
    this.lastResult = null;

    if (!this.selectedTemplateId) {
      this.flashError('Selecciona un template.');
      return;
    }
    if (this.selected.length === 0) {
      this.flashError('Agrega al menos un estudiante.');
      return;
    }
    const expiresAt = this.fromLocalInput(this.expiresLocal);
    if (!expiresAt) {
      this.flashError('Fecha de vencimiento inválida.');
      return;
    }
    if (!Number.isInteger(this.maxAttempts) || this.maxAttempts < 1) {
      this.flashError('maxAttempts debe ser ≥ 1.');
      return;
    }

    this.submitting = true;
    this.platformAssessmentService
      .assignTemplate(this.selectedTemplateId, {
        students: this.selected.map((s) => ({
          studentId: s.studentId,
          name: s.name,
          email: s.email,
          stageNumber: s.stageNumber,
        })),
        expiresAt,
        maxAttempts: this.maxAttempts,
      })
      .subscribe({
        next: (res) => {
          this.submitting = false;
          this.lastResult = res;
          this.selected = [];
          this.modal = {
            ...modalInitializer(),
            show: true,
            isSuccess: true,
            message: `Asignados ${res.created.length}; fallidos ${res.failed.length}. Los estudiantes reciben notificación con enlace.`,
            close: () => (this.modal.show = false),
          };
        },
        error: (err) => {
          this.submitting = false;
          this.flashError(
            err?.error?.message ||
              err?.message ||
              'No se pudo asignar el examen.',
          );
        },
      });
  }

  private addStudent(student: Student): void {
    if (this.selected.some((s) => s.studentId === student.id)) {
      return;
    }
    const name =
      [student.user?.firstName, student.user?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      student.name ||
      `ID ${student.id}`;
    this.selected = [
      ...this.selected,
      {
        studentId: student.id,
        name,
        email: student.user?.email || student.email,
        stageNumber: student.stage?.number
          ? String(student.stage.number)
          : undefined,
      },
    ];
  }

  private flashError(message: string): void {
    this.errorMessage = message;
    this.modal = {
      ...modalInitializer(),
      show: true,
      isError: true,
      message,
      close: () => (this.modal.show = false),
    };
  }

  private toLocalInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private fromLocalInput(value: string): string | null {
    if (!value?.trim()) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }
}
