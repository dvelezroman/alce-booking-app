import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';

import {
  StudentsService,
} from '../../../../services/students.service';

import {
  Student,
} from '../../../../services/dtos/student.dto';

import {
  BookingService,
} from '../../../../services/booking.service';

import {
  FilterMeetingsDto,
} from '../../../../services/dtos/booking.dto';

import {
  AssessmentService,
} from '../../../../services/assessment.service';

import {
  LeadSchedulingRequestService,
} from '../../../../services/lead-scheduling-request.service';


interface DaySummaryItem {
  label: string;
  value: number;
  loading?: boolean;
  comingSoon?: boolean;

  type:
    | 'users'
    | 'scheduled'
    | 'completed'
    | 'demos';
}


@Component({
  selector: 'app-admin-dashboard-day-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './admin-dashboard-day-summary.component.html',
  styleUrl: './admin-dashboard-day-summary.component.scss',
})
export class AdminDashboardDaySummaryComponent
  implements OnInit {

  /* =========================
     SUMMARY
  ========================= */

  summaryItems: DaySummaryItem[] = [
    {
      label: 'Estudiantes nuevos hoy',
      value: 0,
      loading: true,
      type: 'users',
    },
    {
      label: 'Clases agendadas hoy',
      value: 0,
      loading: true,
      type: 'scheduled',
    },
    {
      label: 'Evaluaciones asignadas hoy',
      value: 0,
      loading: false,
      comingSoon: true,
      type: 'completed',
    },
    {
      label: 'Demos solicitadas hoy',
      value: 0,
      loading: true,
      type: 'demos',
    },
  ];


  /* =========================
     DEMO KIND
  ========================= */

  private readonly DEMO_KIND =
    'DEMO';


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private studentsService:
      StudentsService,

    private bookingService:
      BookingService,

    private assessmentService:
      AssessmentService,

    private leadSchedulingService:
      LeadSchedulingRequestService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadNewStudentsToday();
    this.loadScheduledMeetingsToday();
    // this.loadAssignedAssessmentsToday();
    this.loadDemoRequestsToday();
  }


  /* =========================
     NEW STUDENTS TODAY
  ========================= */

  private loadNewStudentsToday(): void {

    this.setLoading(
      'users',
      true,
    );

    this.studentsService
      .findStudents({})
      .subscribe({

        next: (
          students: Student[],
        ) => {

          const {
            start,
            end,
          } = this.getTodayRange();

          const total =
            students.filter(
              student => {

                if (
                  !student.createdAt
                ) {
                  return false;
                }

                const createdAt =
                  new Date(
                    student.createdAt,
                  );

                return (
                  !Number.isNaN(
                    createdAt.getTime(),
                  ) &&
                  createdAt >= start &&
                  createdAt <= end
                );
              },
            ).length;

          this.setSummaryValue(
            'users',
            total,
          );

          this.setLoading(
            'users',
            false,
          );
        },

        error: error => {

          console.error(
            'Error al obtener estudiantes nuevos de hoy:',
            error,
          );

          this.setSummaryValue(
            'users',
            0,
          );

          this.setLoading(
            'users',
            false,
          );
        },
      });
  }


  /* =========================
     SCHEDULED MEETINGS TODAY
  ========================= */

  private loadScheduledMeetingsToday(): void {

    this.setLoading(
      'scheduled',
      true,
    );

    const today =
      this.getTodayDate();

    const filter:
      FilterMeetingsDto = {
        from: today,
        to: today,
      };

    this.bookingService
      .searchMeetings(
        filter,
      )
      .subscribe({

        next: meetings => {

          this.setSummaryValue(
            'scheduled',
            meetings.length,
          );

          this.setLoading(
            'scheduled',
            false,
          );
        },

        error: error => {

          console.error(
            'Error al obtener clases agendadas de hoy:',
            error,
          );

          this.setSummaryValue(
            'scheduled',
            0,
          );

          this.setLoading(
            'scheduled',
            false,
          );
        },
      });
  }


  /* =========================
     ASSIGNED ASSESSMENTS TODAY
  ========================= */

  private loadAssignedAssessmentsToday(): void {

    this.setLoading(
      'completed',
      true,
    );

    const {
      start,
      end,
    } = this.getTodayRange();

    this.assessmentService
      .findAll({})
      .subscribe({

        next: assessments => {

          const total =
            assessments.filter(
              assessment => {

                if (
                  !assessment.createdAt
                ) {
                  return false;
                }

                const createdAt =
                  new Date(
                    assessment.createdAt,
                  );

                return (
                  !Number.isNaN(
                    createdAt.getTime(),
                  ) &&
                  createdAt >= start &&
                  createdAt <= end
                );
              },
            ).length;

          this.setSummaryValue(
            'completed',
            total,
          );

          this.setLoading(
            'completed',
            false,
          );
        },

        error: error => {

          console.error(
            'Error al obtener evaluaciones asignadas de hoy:',
            error,
          );

          this.setSummaryValue(
            'completed',
            0,
          );

          this.setLoading(
            'completed',
            false,
          );
        },
      });
  }


  /* =========================
     DEMO REQUESTS TODAY
  ========================= */

  private loadDemoRequestsToday(): void {

    this.setLoading(
      'demos',
      true,
    );

    const today =
      this.getTodayDate();

    this.leadSchedulingService
      .listAdmin({
        kind:
          this.DEMO_KIND,

        createdFrom:
          today,

        createdTo:
          today,

        limit:
          1,

        offset:
          0,
      })
      .subscribe({

        next: response => {

          this.setSummaryValue(
            'demos',
            response.total ?? 0,
          );

          this.setLoading(
            'demos',
            false,
          );
        },

        error: error => {

          console.error(
            'Error al obtener demos solicitadas de hoy:',
            error,
          );

          this.setSummaryValue(
            'demos',
            0,
          );

          this.setLoading(
            'demos',
            false,
          );
        },
      });
  }


  /* =========================
     SUMMARY VALUE
  ========================= */

  private setSummaryValue(
    type:
      DaySummaryItem['type'],

    value:
      number,
  ): void {

    const item =
      this.summaryItems.find(
        item =>
          item.type === type,
      );

    if (item) {
      item.value =
        value;
    }
  }


  /* =========================
     LOADING
  ========================= */

  private setLoading(
    type:
      DaySummaryItem['type'],

    loading:
      boolean,
  ): void {

    const item =
      this.summaryItems.find(
        item =>
          item.type === type,
      );

    if (item) {
      item.loading =
        loading;
    }
  }


  /* =========================
     TODAY DATE
  ========================= */

  private getTodayDate(): string {

    return this.formatDate(
      new Date(),
    );
  }


  /* =========================
     TODAY RANGE
  ========================= */

  private getTodayRange(): {
    start: Date;
    end: Date;
  } {

    const start =
      new Date();

    start.setHours(
      0,
      0,
      0,
      0,
    );

    const end =
      new Date();

    end.setHours(
      23,
      59,
      59,
      999,
    );

    return {
      start,
      end,
    };
  }


  /* =========================
     FORMAT DATE
  ========================= */

  private formatDate(
    date: Date,
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return (
      `${year}-${month}-${day}`
    );
  }
}