import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs';
import { UserRole } from './dtos/user.dto';
import {
  LeadSchedulingRequestRow,
  LeadSchedulingRequestStatus,
} from './dtos/lead-scheduling-request.dto';
import { LeadSchedulingRequestService } from './lead-scheduling-request.service';

const ADMIN_LEAD_ROUTE = '/dashboard/admin/lead-scheduling-requests';
const INSTRUCTOR_LEAD_ROUTE = '/dashboard/instructor/lead-scheduling-requests';

const ACTIVE_STATUSES: LeadSchedulingRequestStatus[] = [
  'PENDING',
  'SCHEDULED',
];

@Injectable({ providedIn: 'root' })
export class LeadSchedulingPendingCountService {
  private readonly adminPendingSubject = new BehaviorSubject<number>(0);
  private readonly instructorPendingSubject = new BehaviorSubject<number>(0);

  readonly adminPending$ = this.adminPendingSubject.asObservable();
  readonly instructorPending$ = this.instructorPendingSubject.asObservable();

  private readonly batchSize = 100;
  private readonly fetchCap = 5000;

  constructor(private readonly leadScheduling: LeadSchedulingRequestService) {}

  getCountForRoute(route: string): number {
    if (route === ADMIN_LEAD_ROUTE || route.startsWith(ADMIN_LEAD_ROUTE + '/')) {
      return this.adminPendingSubject.value;
    }
    if (
      route === INSTRUCTOR_LEAD_ROUTE ||
      route.startsWith(INSTRUCTOR_LEAD_ROUTE + '/')
    ) {
      return this.instructorPendingSubject.value;
    }
    return 0;
  }

  hasLeadSchedulingNavBadge(route: string): boolean {
    return (
      (route === ADMIN_LEAD_ROUTE || route === INSTRUCTOR_LEAD_ROUTE) &&
      this.getCountForRoute(route) > 0
    );
  }

  getCountForRole(role: UserRole | null | undefined): number {
    if (role === UserRole.ADMIN) return this.adminPendingSubject.value;
    if (role === UserRole.INSTRUCTOR) return this.instructorPendingSubject.value;
    return 0;
  }

  refresh(role: UserRole | null | undefined): Observable<void> {
    if (role === UserRole.ADMIN) {
      return this.countAdminWithoutTutor().pipe(
        tap((count) => this.adminPendingSubject.next(count)),
        map(() => void 0),
        catchError(() => {
          this.adminPendingSubject.next(0);
          return of(void 0);
        }),
      );
    }

    if (role === UserRole.INSTRUCTOR) {
      return this.countInstructorPendingReport().pipe(
        tap((count) => this.instructorPendingSubject.next(count)),
        map(() => void 0),
        catchError(() => {
          this.instructorPendingSubject.next(0);
          return of(void 0);
        }),
      );
    }

    this.adminPendingSubject.next(0);
    this.instructorPendingSubject.next(0);
    return of(void 0);
  }

  reset(): void {
    this.adminPendingSubject.next(0);
    this.instructorPendingSubject.next(0);
  }

  /** Solicitudes activas (cortesía / ubicación) sin tutor asignado. */
  private countAdminWithoutTutor(): Observable<number> {
    return forkJoin(
      ACTIVE_STATUSES.map((status) =>
        this.fetchAllAdminRows({ status }),
      ),
    ).pipe(
      map((groups) => {
        const byId = new Map<number, LeadSchedulingRequestRow>();
        for (const rows of groups) {
          for (const row of rows) {
            byId.set(row.id, row);
          }
        }
        return [...byId.values()].filter((row) => this.isAdminUnassigned(row))
          .length;
      }),
    );
  }

  /** Solicitudes asignadas al instructor sin asistencia/informe enviado. */
  private countInstructorPendingReport(): Observable<number> {
    return this.fetchAllInstructorRows({ status: 'SCHEDULED' }).pipe(
      map((rows) => rows.filter((row) => this.isInstructorActionPending(row)).length),
    );
  }

  private isAdminUnassigned(row: LeadSchedulingRequestRow): boolean {
    return (
      row.instructorId == null &&
      row.instructor == null &&
      row.status !== 'CANCELLED' &&
      row.status !== 'COMPLETED'
    );
  }

  private isInstructorActionPending(row: LeadSchedulingRequestRow): boolean {
    return (
      row.status === 'SCHEDULED' && !row.instructorReportSubmittedAt
    );
  }

  private fetchAllAdminRows(query: {
    status?: LeadSchedulingRequestStatus;
  }): Observable<LeadSchedulingRequestRow[]> {
    return this.fetchAllPages((offset) =>
      this.leadScheduling.listAdmin({
        ...query,
        limit: this.batchSize,
        offset,
      }),
    );
  }

  private fetchAllInstructorRows(query: {
    status?: LeadSchedulingRequestStatus;
  }): Observable<LeadSchedulingRequestRow[]> {
    return this.fetchAllPages((offset) =>
      this.leadScheduling.listMine({
        ...query,
        limit: this.batchSize,
        offset,
      }),
    );
  }

  private fetchAllPages(
    fetchPage: (offset: number) => Observable<{
      items: LeadSchedulingRequestRow[];
      total: number;
    }>,
  ): Observable<LeadSchedulingRequestRow[]> {
    const acc: LeadSchedulingRequestRow[] = [];

    const pull = (offset: number): Observable<LeadSchedulingRequestRow[]> => {
      return fetchPage(offset).pipe(
        switchMap((res) => {
          acc.push(...res.items);
          const reportedTotal = res.total ?? acc.length;
          const got = res.items.length;
          const underTotal = acc.length < reportedTotal;
          const fullBatch = got === this.batchSize;
          const underCap = acc.length < this.fetchCap;

          if (underTotal && fullBatch && underCap && got > 0) {
            return pull(offset + this.batchSize);
          }
          return of(acc);
        }),
      );
    };

    return pull(0);
  }
}
