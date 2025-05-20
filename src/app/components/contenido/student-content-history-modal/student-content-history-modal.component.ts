import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyContentDto, StudyContentPayloadI } from '../../../services/dtos/study-content.dto';
import { StudyContentService } from '../../../services/study-content.service';

@Component({
  selector: 'app-student-content-history-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-content-history-modal.component.html',
  styleUrls: ['./student-content-history-modal.component.scss']
})
export class StudentContentHistoryModalComponent implements OnInit, OnChanges {
  @Input() history: StudyContentPayloadI[] = [];
  @Input() show: boolean = false;
  @Input() stageId?: number;
  @Input() stageContents: StudyContentDto[] = [];
  @Input() instructorName?: string;
  @Input() stageDescription?: string;
  @Output() close = new EventEmitter<void>();
  @Output() previousStage = new EventEmitter<void>();
  @Output() nextStage = new EventEmitter<void>();
  @Input() canGoPrevious: boolean = true;
  @Input() canGoNext: boolean = true;  


  constructor(private studyContentService: StudyContentService) {}

  ngOnInit(): void {
    if (this.stageId) {
      this.loadStageContents(this.stageId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stageId'] && this.stageId) {
      this.loadStageContents(this.stageId);
    }
  }

  get currentStageDescription(): string {
    if (this.stageContents.length > 0 && this.stageContents[0].stage?.description) {
      return this.stageContents[0].stage.description;
    }
    return this.stageDescription || 'Stage no disponible';
  }

  getRecordsByContentTitle(title: string): StudyContentPayloadI[] {
    return this.history.filter(r => r.data?.title === title);
  }

  loadStageContents(stageId: number): void {
    this.studyContentService.filterBy(stageId).subscribe({
      next: (contents) => {
        this.stageContents = contents.length > 0 ? contents : [];
      },
      error: (err) => {
        console.error('Error al cargar los contenidos del stage', err);
        this.stageContents = [];
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  onPreviousStage() {
    this.previousStage.emit();
  }

  onNextStage() {
    this.nextStage.emit();
  }
}