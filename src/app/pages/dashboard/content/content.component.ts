import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentFormComponent } from '../../../components/contenido/content-form/content-form.component';
import { EditContentModalComponent } from '../../../components/contenido/edit-content-modal/edit-content-modal.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { StudyContentDto, StudyContentCreateDto, StudyContentUpdateDto } from '../../../services/dtos/study-content.dto';
import { StagesService } from '../../../services/stages.service';
import { StudyContentService } from '../../../services/study-content.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
      CommonModule,
      ContentFormComponent,
      ReactiveFormsModule,
      EditContentModalComponent,
      ModalComponent
    ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit {
  showModal = false;
  stages: Stage[] = [];
  filteredContents: StudyContentDto[] = [];
  contentToEdit: StudyContentDto | null = null;
  modal: ModalDto = modalInitializer();

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

  parseContent(content: string | null | undefined): string {
    try {
      const parsed = JSON.parse(content ?? '""');
      return typeof parsed === 'string' ? parsed : '';
    } catch {
      return content ?? '';
    }
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
        this.showNotification('Contenido creado correctamente', false, true);
        this.searchContent();
      },
      error: (err) => {
        this.showNotification('Error al crear el contenido', true);
        console.error(err);
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
        this.showNotification('Contenido actualizado correctamente', false, true);
        this.contentToEdit = null;
        this.searchContent();
      },
      error: (err) => {
        console.error('Error al actualizar contenido:', err);
        this.showNotification('Error al actualizar el contenido', true);
      }
    });
  }

  closeEditModal() {
    this.contentToEdit = null;
  }

  confirmDelete(id: number) {
    this.studyContentService.delete(id).subscribe({
      next: () => {
        this.showNotification('Contenido eliminado correctamente', false, true);
        this.searchContent();
      },
      error: (err) => {
        console.error('Error al eliminar contenido:', err);
        this.showNotification('Error al eliminar el contenido', true);
      }
    });
  
    this.modal.show = false;
  }

  deleteContent(id: number) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: '¿Estás seguro de eliminar este contenido?',
      isInfo: true,
      showButtons: true,
      close: () => this.modal.show = false,
      confirm: () => this.confirmDelete(id)
    };
  }

  showNotification(message: string, isError: boolean = false, isSuccess: boolean = false) {
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

  protected readonly JSON = JSON;
}
