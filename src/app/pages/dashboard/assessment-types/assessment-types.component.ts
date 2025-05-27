import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssessmentTypeFormComponent } from '../../../components/assessment-types/assessment-type-form.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { AssessmentTypesService } from '../../../services/assessment-types.service';
import { AssessmentTypeI } from '../../../services/dtos/assessment-type.dto';

@Component({
  selector: 'app-assessment-types',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AssessmentTypeFormComponent,
    ModalComponent
  ],
  templateUrl: './assessment-types.component.html',
  styleUrl: './assessment-types.component.scss'
})
export class AssessmentTypesComponent {
 modal: ModalDto = modalInitializer();
  showConfigForm: boolean = false;
  assessmentTypes: AssessmentTypeI[] = [];
  typeToEdit: AssessmentTypeI | null = null;
  editForm!: FormGroup;

  constructor(
    private assessmentTypesService: AssessmentTypesService,
    private fb: FormBuilder
  ) {
     this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadAssessmentTypes();

  }

  loadAssessmentTypes(): void {
    this.assessmentTypesService.getAll().subscribe({
      next: (types) => {
        this.assessmentTypes = types;
      },
      error: () => {
        this.showNotification('Error al cargar los tipos de evaluación', true);
      }
    });
  }

  handleCreateAssessmentType(type: { name: string; description?: string }) {
    this.assessmentTypesService.create(type).subscribe({
      next: () => {
        this.showNotification('Tipo de evaluación creado correctamente', false, true);
        this.loadAssessmentTypes();
      },
      error: () => {
        this.showNotification('Error al crear el tipo de evaluación', true);
      }
    });
  }

  openEditModal(type: AssessmentTypeI): void {
    this.typeToEdit = type;
    this.editForm.setValue({
      name: type.name,
      description: type.description ?? ''
    });
  }

  updateAssessmentType(): void {
    if (!this.typeToEdit || this.editForm.invalid) return;

    const updatedData = this.editForm.value;

    this.assessmentTypesService.update(this.typeToEdit.id!, updatedData).subscribe({
      next: () => {
        this.showNotification('Tipo de evaluación actualizado correctamente', false, true);
        this.loadAssessmentTypes();
        this.typeToEdit = null;
        this.editForm.reset();
      },
      error: () => {
        this.showNotification('Error al actualizar el tipo de evaluación', true);
      }
    });
  }

  cancelEdit(): void {
    this.typeToEdit = null;
    this.editForm.reset();
  }

  showNotification(message: string, isError = false, isSuccess = false) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () => this.modal.show = false
    };

    setTimeout(() => {
      this.modal.show = false;
    }, 2500);
  }

  deleteAssessmentType(id: number): void {
    this.assessmentTypesService.delete(id).subscribe({
      next: () => {
        this.showNotification('Tipo de evaluación eliminado correctamente', false, true);
        this.loadAssessmentTypes();
      },
      error: () => {
        this.showNotification('Error al eliminar el tipo de evaluación', true);
      }
    });

    this.modal.show = false;
  }

  confirmDeleteType(type: AssessmentTypeI): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: `¿Estás seguro de eliminar el tipo de evaluación?`,
      isInfo: true,
      showButtons: true,
      close: () => this.modal.show = false,
      confirm: () => this.deleteAssessmentType(type.id!)
    };
  }
}
