import { Component, OnInit } from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms"; // Adjust the import path as needed
import { Stage, CreateStageDto } from '../../../services/dtos/student.dto';
import { StagesService } from '../../../services/stages.service';


@Component({
  selector: 'app-stage-list',
  templateUrl: './stage.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  styleUrls: ['./stage.component.scss']
})
export class StageComponent implements OnInit {
  stages: Stage[] = [];
  newStage: CreateStageDto = { number: '', description: '' };
  selectedStage: Stage | null = null;
  isCreateModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  isNotificationModalOpen = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';


  constructor(private stagesService: StagesService) {}

  ngOnInit(): void {
    this.loadStages();
  }

  loadStages(): void {
    this.stagesService.getAll().subscribe({
      next: (data) =>
      {
        this.stages = data;
      }
    ,
      error: (error) => {
        console.error('Error fetching stages:', error);
        this.showNotification('Error al cargar los stages', 'error');
      }
    });
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.newStage = { number: '0', description: '' }; // Reset form
  }

  createStage(): void {
    this.stagesService.create(this.newStage).subscribe(
      () => {
        this.loadStages();
        this.showNotification('Stage creado exitosamente', 'success');
        this.closeCreateModal();
      },
      error => {
        console.error('Error creating stage:', error);
        this.showNotification('No se pudo crear el stage', 'error');
      }
    );
  }

  openEditModal(stage: Stage): void {
    this.selectedStage = { ...stage };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedStage = null;
  }

  updateStage(): void {
    if (this.selectedStage) {
      this.stagesService.update(this.selectedStage.id, this.selectedStage).subscribe(
        () => {
          this.loadStages();
          this.showNotification('Stage actualizado exitosamente', 'success');
          this.closeEditModal();
        },
        error => {
          console.error('Error updating stage:', error);
          this.showNotification( 'No se pudo actualizar el stage', 'error');
        }
      );
    }
  }

  openDeleteModal(stage: Stage): void {
    this.selectedStage = stage;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedStage = null;
  }

  deleteStage(): void {
    if (this.selectedStage) {
      this.stagesService.delete(this.selectedStage.id).subscribe(
        () => {
          this.loadStages();
          this.showNotification( 'Stage eliminado exitosamente', 'success');
          this.closeDeleteModal();
        },
        error => {
          console.error('Error deleting stage:', error);
          this.showNotification( 'No se pudo eliminar el stage', 'error');
        }
      );
    }
  }

 // Mostrar el modal de notificación
 showNotification(message: string, type: 'success' | 'error'): void {
  this.notificationMessage = message;
  this.notificationType = type;
  this.isNotificationModalOpen = true;

  setTimeout(() => {
    this.isNotificationModalOpen = false;
  }, 2000);
}
}
