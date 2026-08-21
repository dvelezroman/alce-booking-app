import {
  Component,
  Input,
} from '@angular/core';

import {
  AssignPlatformAssessmentsResult,
} from '../../../services/dtos/platform-assessment.dto';


@Component({
  selector: 'app-platform-assessments-assign-result',
  standalone: true,
  imports: [],
  templateUrl: './platform-assessments-assign-result.component.html',
  styleUrl: './platform-assessments-assign-result.component.scss',
})
export class PlatformAssessmentsAssignResultComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  result!: AssignPlatformAssessmentsResult;


  /* =========================
     STATE
  ========================= */

  get hasCreated(): boolean {
    return (
      this.result?.created?.length > 0
    );
  }


  get hasFailed(): boolean {
    return (
      this.result?.failed?.length > 0
    );
  }


  get createdCount(): number {
    return (
      this.result?.created?.length ??
      0
    );
  }


  get failedCount(): number {
    return (
      this.result?.failed?.length ??
      0
    );
  }

}