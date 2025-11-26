import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { StageAssessmentService } from '../../../services/stage-assessment.service';
import { selectUserData } from '../../../store/user.selector';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-stage-assessment-student',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './stage-assessment-student.component.html',
  styleUrls: ['./stage-assessment-student.component.scss']
})
export class StageAssessmentStudentComponent implements OnInit {

  studentId: number | null = null;
  hasActiveAssessments: boolean = false;

  modal: ModalDto = modalInitializer();

  constructor(
    private store: Store,
    private stageAssessmentService: StageAssessmentService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).pipe(take(1)).subscribe((u: UserDto | null) => {
      this.studentId = u?.student?.id ?? null;
      console.log(this.studentId);

      if (!this.studentId) {
        this.showNotification("Error al verificar evaluaciones activas.", true);
        return;
      }

      this.checkActiveAssessments();
    });
  }

  private checkActiveAssessments() {
    this.stageAssessmentService.checkActiveByStudent(this.studentId!).subscribe({
      next: (res) => {
        this.hasActiveAssessments = res.hasActive;
        console.log(res.count);
      },
      error: () => {
        this.showNotification("Error al verificar evaluaciones activas.", true);
      }
    });
  }

  private showNotification(message: string, isError = false, isSuccess = false) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      isInfo: !isError && !isSuccess,
      close: () => (this.modal.show = false)
    };

    setTimeout(() => (this.modal.show = false), 2000);
  }
  
}