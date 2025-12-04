import { Component, OnDestroy, OnInit } from '@angular/core';
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

        // Si cambia el estudiante (o recién se carga), volvemos a pedir su progreso
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
        next: (progressList) => {
          if (Array.isArray(progressList) && progressList.length > 0) {
            this.progress = progressList[0];
          } else {
            this.progress = null;
          }
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.progress = null;
        }
      });
  }

  /**
   * Devuelve el porcentaje de progreso en 0–100.
   * Ajusta esta lógica a tu StageProgressDto real.
   */
  get progressPercent(): number {
    if (!this.progress) return 0;

    // 👉 Ajusta estos campos según tu modelo real:
    // Ejemplo 1: si tu DTO ya trae un "percentage"
    const raw = (this.progress as any).percentage 
             ?? (this.progress as any).progress 
             ?? 0;

    let value = Number(raw) || 0;

    if (value < 0) value = 0;
    if (value > 100) value = 100;

    return value;
  }

  get hasProgress(): boolean {
    return !!this.progress && this.progressPercent > 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}