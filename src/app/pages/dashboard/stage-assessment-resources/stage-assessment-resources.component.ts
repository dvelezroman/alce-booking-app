import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { StageAssessmentResourcesService } from '../../../services/stage-assessment-resources.service';
import { StageResourcesAssessmentFormComponent } from '../../../components/stage-resources-assessment/stage-resources-form/stage-resources-form.component';
import { StageAssessmentResource } from '../../../services/dtos/stage-resources.dto';
import { StageResourcesModalComponent } from '../../../components/stage-resources-assessment/stage-resources-modal/stage-resources-modal.component';

@Component({
  selector: 'app-stage-assessment-resources',
  standalone: true,
  imports: [
    CommonModule,
    StageResourcesAssessmentFormComponent,
    StageResourcesModalComponent,
    ModalComponent,
  ],
  templateUrl: './stage-assessment-resources.component.html',
  styleUrl: './stage-assessment-resources.component.scss'
})
export class StageAssessmentResourcesComponent implements OnInit {

  modal: ModalDto = modalInitializer();
  resources: StageAssessmentResource[] = [];

  resourceToEdit: StageAssessmentResource | null = null

  constructor(
    private service: StageAssessmentResourcesService,
  ) {}

  ngOnInit(): void {
    this.loadResources();
  }

  /** GET ALL */
  loadResources() {
    this.service.getAll().subscribe({
      next: (res) => this.resources = res,
      error: () => this.showNotification("Error al cargar los recursos", true)
    });
  }

  /** CREATE FROM CHILD */
  onFormSubmit(data: { stageId: number; description: string; url: string; active: boolean }) {
    this.service.create(data).subscribe({
      next: () => {
        this.showNotification("Recurso creado correctamente", false, true);
        this.loadResources();
      },
      error: () => this.showNotification("Error al crear recurso", true)
    });
  }

  /** ---------- EDIT LOGIC ---------- */

  /** Abrir modal */
  openEditModal(resource: StageAssessmentResource) {
    this.resourceToEdit = resource;
  }

  /** Recibir valores y actualizar */
  updateResource(updatedData: any) {
    if (!this.resourceToEdit) return;

    this.service.update(this.resourceToEdit.id, updatedData).subscribe({
      next: () => {
        this.showNotification("Recurso actualizado correctamente", false, true);
        this.resourceToEdit = null;
        this.loadResources();
      },
      error: () => this.showNotification("Error al actualizar recurso", true)
    });
  }

  /** Cerrar modal */
  cancelEdit() {
    this.resourceToEdit = null;
  }

  /** DELETE FINAL */
  deleteResource(id: number) {
    this.service.delete(id).subscribe({
      next: () => {
        this.showNotification("Recurso eliminado", false, true);
        this.loadResources();
      },
      error: () => this.showNotification("Error al eliminar recurso", true)
    });

    this.modal.show = false;
  }

  /** OPEN CONFIRMATION MODAL */
  confirmDeleteResource(resource: StageAssessmentResource) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: `¿Seguro que deseas eliminar este recurso del Stage?`,
      isInfo: true,
      showButtons: true,
      close: () => (this.modal.show = false),
      confirm: () => this.deleteResource(resource.id)
    };
  }

  /** NOTIFICATION MODAL */
  private showNotification(message: string, isError = false, isSuccess = false) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () => (this.modal.show = false)
    };

    setTimeout(() => (this.modal.show = false), 2000);
  }
}