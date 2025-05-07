import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentFormComponent } from '../../components/content-form/content-form.component';
import { StudyContentService } from '../../services/study-content.service';
import {StudyContentCreateDto, StudyContentDto} from '../../services/dtos/study-content.dto';
import { Stage } from '../../services/dtos/student.dto';
import { StagesService } from '../../services/stages.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
      CommonModule,
      ContentFormComponent,
      ReactiveFormsModule
    ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit {
  showModal = false;
  stages: Stage[] = [];
  filteredContents: StudyContentDto[] = [];

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
    console.log('Editar contenido:', content);
  }

  deleteContent(id: number) {
    console.log('Eliminar contenido con ID:', id);
  }

  protected readonly JSON = JSON;
}
