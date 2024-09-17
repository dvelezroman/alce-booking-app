import { Component, OnInit } from '@angular/core';
import {StagesService} from "../../services/stages.service";
import {CreateStageDto, Stage} from "../../services/dtos/student.dto";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms"; // Adjust the import path as needed

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
  newStage: CreateStageDto = { number: 0, description: '' };
  selectedStage: Stage | null = null;
  isCreateModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

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
      }
    });
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.newStage = { number: 0, description: '' }; // Reset form
  }

  createStage(): void {
    this.stagesService.create(this.newStage).subscribe(
      () => {
        this.loadStages();
        this.closeCreateModal();
      },
      error => {
        console.error('Error creating stage:', error);
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
          this.closeEditModal();
        },
        error => {
          console.error('Error updating stage:', error);
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
          this.closeDeleteModal();
        },
        error => {
          console.error('Error deleting stage:', error);
        }
      );
    }
  }
}
