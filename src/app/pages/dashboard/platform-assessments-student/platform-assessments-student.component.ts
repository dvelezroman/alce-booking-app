import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { selectUserData } from '../../../store/user.selector';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { PlatformAssessmentAssignment } from '../../../services/dtos/platform-assessment.dto';
import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import { PlatformAssessmentCardComponent } from '../../../components/platform-assessment/platform-assessment-card/platform-assessment-card.component';

@Component({
  selector: 'app-platform-assessments-student',
  standalone: true,
  imports: [CommonModule, ModalComponent, PlatformAssessmentCardComponent],
  templateUrl: './platform-assessments-student.component.html',
  styleUrls: ['./platform-assessments-student.component.scss'],
})
export class PlatformAssessmentsStudentComponent implements OnInit {
  studentId: number | null = null;
  loading = true;

  pendingAssessments: PlatformAssessmentAssignment[] = [];
  expiredAssessments: PlatformAssessmentAssignment[] = [];
  completedAssessments: PlatformAssessmentAssignment[] = [];

  activeCount = 0;
  expiredCount = 0;
  hasPending = false;
  hasExpired = false;

  modal: ModalDto = modalInitializer();

  constructor(
    private store: Store,
    private platformAssessmentService: PlatformAssessmentService,
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectUserData)
      .pipe(
        filter((u): u is UserDto => !!u),
        take(1),
      )
      .subscribe((u) => {
        this.studentId = u.student?.id ?? null;

        if (!this.studentId) {
          this.loading = false;
          this.showNotification('No se pudo obtener tu información.', true);
          return;
        }

        this.loadAssessments();
      });
  }

  private loadAssessments(): void {
    if (!this.studentId) return;

    this.loading = true;

    this.platformAssessmentService.getAll(this.studentId).subscribe({
      next: (list) => {
        const items = list ?? [];

        this.pendingAssessments = items.filter((a) => a.status === 'pending');
        this.expiredAssessments = items.filter((a) => a.status === 'expired');
        this.completedAssessments = items.filter(
          (a) => a.status === 'completed',
        );

        this.activeCount = this.pendingAssessments.length;
        this.expiredCount = this.expiredAssessments.length;
        this.hasPending = this.activeCount > 0;
        this.hasExpired = this.expiredCount > 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showNotification('Error al obtener assessments de plataforma.', true);
      },
    });
  }

  private showNotification(
    message: string,
    isError = false,
    isSuccess = false,
  ): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      isInfo: !isError && !isSuccess,
    };
  }
}
