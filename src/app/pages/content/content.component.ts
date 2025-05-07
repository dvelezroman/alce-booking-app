import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentFormComponent } from '../../components/contenido/content-form/content-form.component';
import { StudyContentService } from '../../services/study-content.service';
import {StudyContentCreateDto, StudyContentDto, StudyContentUpdateDto} from '../../services/dtos/study-content.dto';
import { Stage } from '../../services/dtos/student.dto';
import { StagesService } from '../../services/stages.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditContentModalComponent } from '../../components/contenido/edit-content-modal/edit-content-modal.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
      CommonModule,
      ContentFormComponent,
      ReactiveFormsModule,
      EditContentModalComponent
    ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit {
  showModal = false;
  stages: Stage[] = [];
  filteredContents: StudyContentDto[] = [];
  contentToEdit: StudyContentDto | null = null;

  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private stagesService: StagesService,
    private studyContentService: StudyContentService
  ){
    this.filterForm = this.fb.group({
      stageId: [undefined, [Validators.min(1)]],
      unit: [undefined, [Validators.min(1)]],
    });
   }

  ngOnInit(): void {
    this.stagesService.getAll().subscribe(stages => {
      this.stages = stages;
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  searchContent() {
    const { stageId, unit } = this.filterForm.value;
    this.studyContentService.filterBy(stageId, unit).subscribe({
      next: (results) => {
        this.filteredContents = results;
      },
      error: (err) => {
        console.error('Error al filtrar contenido:', err);
      }
    });
  }

  handleFormSubmit(data: StudyContentCreateDto) {
    this.showModal = false;
    this.studyContentService.create(data).subscribe({
      next: (response) => {
        console.log('Contenido creado exitosamente:', response);
      },
      error: (err) => {
        console.error('Error al crear el contenido:', err);
      }
    });
  }

  editContent(content: StudyContentDto) {
    console.log('Editando contenido:', content);
    this.contentToEdit = content;
  }

  handleUpdateContent(updated: StudyContentUpdateDto) {
    if (!this.contentToEdit) return;
  
    this.studyContentService.update(this.contentToEdit.id, updated).subscribe({
      next: (res) => {
        console.log('Contenido actualizado:', res);
        this.contentToEdit = null;
        this.searchContent(); 
      },
      error: (err) => {
        console.error('Error al actualizar contenido:', err);
      }
    });
  }

  closeEditModal() {
    this.contentToEdit = null;
  }

  deleteContent(id: number) {
    this.studyContentService.delete(id).subscribe({
      next: () => {
        console.log(`${id} eliminado correctamente`);
        this.searchContent();
      },
      error: (err) => {
        console.error('Error al eliminar contenido:', err);
      }
    });
  }

  protected readonly JSON = JSON;
}
