import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { AssessmentResourceI } from '../../../services/dtos/assessment-resources.dto';
import { AssessmentResourcesService } from '../../../services/assessment-resources.service';
import { AssessmentResourceFormComponent } from '../../../components/assessment-resource-form/assessment-resource-form.component';

@Component({
  selector: 'app-academic-resources',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AssessmentResourceFormComponent,
    ModalComponent
  ],
  templateUrl: './academic-resources.component.html',
  styleUrl: './academic-resources.component.scss'
})
export class AcademicResourcesComponent implements OnInit {
  modal: ModalDto = modalInitializer();
  resources: AssessmentResourceI[] = [];
  resourceToEdit: AssessmentResourceI | null = null;
  editForm!: FormGroup;

  constructor(
    private assessmentResourcesService: AssessmentResourcesService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      link: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadResources();
  }

  loadResources(): void {
    this.assessmentResourcesService.getAll().subscribe({
      next: (resources) => {
        this.resources = resources;
      },
      error: () => {
        this.showNotification('Error al cargar los recursos', true);
      }
    });
  }

  handleCreateResource(resource: { title: string; link: string }) {
    this.assessmentResourcesService.create(resource).subscribe({
      next: () => {
        this.showNotification('Recurso creado correctamente', false, true);
        this.loadResources();
      },
      error: () => {
        this.showNotification('Error al crear el recurso', true);
      }
    });
  }

  openEditModal(resource: AssessmentResourceI): void {
    this.resourceToEdit = resource;
    this.editForm.setValue({
      title: resource.title,
      link: resource.link
    });
  }

  updateResource(): void {
    if (!this.resourceToEdit || this.editForm.invalid) return;

    const updatedData = this.editForm.value;

    this.assessmentResourcesService.update(this.resourceToEdit.id, updatedData).subscribe({
      next: () => {
        this.showNotification('Recurso actualizado correctamente', false, true);
        this.loadResources();
        this.resourceToEdit = null;
        this.editForm.reset();
      },
      error: () => {
        this.showNotification('Error al actualizar el recurso', true);
      }
    });
  }

  cancelEdit(): void {
    this.resourceToEdit = null;
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

  deleteResource(id: number): void {
    this.assessmentResourcesService.delete(id).subscribe({
      next: () => {
        this.showNotification('Recurso eliminado correctamente', false, true);
        this.loadResources();
      },
      error: () => {
        this.showNotification('Error al eliminar el recurso', true);
      }
    });

    this.modal.show = false;
  }

  confirmDeleteResource(resource: AssessmentResourceI): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: `¿Estás seguro de eliminar el recurso "${resource.title}"?`,
      isInfo: true,
      showButtons: true,
      close: () => this.modal.show = false,
      confirm: () => this.deleteResource(resource.id)
    };
  }
}