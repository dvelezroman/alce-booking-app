import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { StageProgressDto } from '../../../services/dtos/stage-progress.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { StageProgressService } from '../../../services/stage-progress';
import { selectUserData } from '../../../store/user.selector';

@Component({
  selector: 'app-student-stage-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-stage-progress.component.html',
  styleUrls: ['./student-stage-progress.component.scss'],
})
export class StudentStageProgressComponent implements OnInit, OnDestroy {

  @Input() currentStageId: number | null = null;

  private destroy$ = new Subject<void>();

  user: UserDto | null = null;
  studentId: number | null = null;

  loading = false;
  error = false;

  progress: StageProgressDto | null = null;

  constructor(
    private store: Store,
    private stageProgressService: StageProgressService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user ?? null;

        const newStudentId = user?.student?.id ?? null;

        if (newStudentId && newStudentId !== this.studentId) {
          this.studentId = newStudentId;
          this.loadProgress(newStudentId);
        }
      });
  }

  private loadProgress(studentId: number): void {
    this.loading = true;
    this.error = false;
    this.progress = null;

    this.stageProgressService.getProgressByStudent(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => this.handleProgressResponse(list),
        error: () => {
          this.error = true;
          this.loading = false;
          this.progress = null;
        }
      });
  }

  private handleProgressResponse(progressList: StageProgressDto[]): void {
    if (!Array.isArray(progressList) || progressList.length === 0) {
      this.progress = null;
      this.loading = false;
      return;
    }

    if (this.currentStageId === null) {
      this.progress = null;
      this.loading = false;
      return;
    }

    // Tomar SOLO el progreso del stage actual del estudiante
    const match = progressList.find(
      p => Number(p.stageId) === Number(this.currentStageId)
    );

    this.progress = match ?? null;
    this.loading = false;
  }

  /**
   * Porcentaje de progreso (0–100)
   */
  get progressPercent(): number {
    if (!this.progress) return 0;

    const raw =
      (this.progress as any).percentage ??
      (this.progress as any).progress ??
      0;

    let value = Number(raw) || 0;

    if (value < 0) value = 0;
    if (value > 100) value = 100;

    return value;
  }

  get hasProgress(): boolean {
    return this.progress !== null;
  }

  /* ===========================
     🧠 STAGE LOGIC (0 → 19)
     =========================== */

  get currentStageLabel(): string {
    if (this.currentStageId === null) return '—';
    return `Stage ${this.currentStageId}`;
  }

  get nextStageLabel(): string {
    if (this.currentStageId === null) return '—';

    if (this.currentStageId >= 19) {
      return 'Nivel máximo';
    }

    return `Stage ${this.currentStageId + 1}`;
  }

  get hasNextStage(): boolean {
    return this.currentStageId !== null && this.currentStageId < 19;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}