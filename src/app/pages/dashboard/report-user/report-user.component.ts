import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DateTime } from 'luxon';

import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

/* =========================
   NEW CHILD COMPONENTS
========================= */

import { ReportUserHeaderComponent } from '../../../components/report-user/report-user-header/report-user-header.component';
import { ReportUserSummaryComponent } from '../../../components/report-user/report-user-summary/report-user-summary.component';
import { ReportUserFiltersComponent } from '../../../components/report-user/report-user-filters/report-user-filters.component';
import { ReportUserTableComponent } from '../../../components/report-user/report-user-table/report-user-table.component';
import { ReportUserPaginationComponent } from '../../../components/report-user/report-user-pagination/report-user-pagination.component';
import { ReportUserQuickActionsComponent } from '../../../components/report-user/report-user-quick-actions/report-user-quick-actions.component';
import { ReportUserRoleDistributionComponent } from '../../../components/report-user/report-user-role-distribution/report-user-role-distribution.component';
import { ReportUserStatusDistributionComponent } from '../../../components/report-user/report-user-status-distribution/report-user-status-distribution.component';
import { ReportUserDetailPanelComponent } from '../../../components/report-user/report-user-detail-panel/report-user-detail-panel.component';

/* =========================
   SERVICES / DTOs
========================= */

import { ReportsService } from '../../../services/reports.service';
import { UserDto, UserRole, UserStatus } from '../../../services/dtos/user.dto';
import { Stage, StudentStageHistory } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-report-user',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ReportUserHeaderComponent,
    ReportUserSummaryComponent,
    ReportUserFiltersComponent,
    ReportUserTableComponent,
    ReportUserPaginationComponent,
    ReportUserQuickActionsComponent,
    ReportUserRoleDistributionComponent,
    ReportUserStatusDistributionComponent,
    ReportUserDetailPanelComponent,
  ],
  templateUrl: './report-user.component.html',
  styleUrl: './report-user.component.scss'
})
export class ReportUserComponent {

  modal: ModalDto = modalInitializer();

  /* =========================
     DATA
  ========================= */

  users: UserDto[] = [];
  totalUsers: number = 0;

  /* =========================
     LOADING
  ========================= */

  isLoading = false;

  /* =========================
     PAGINATION
  ========================= */

  totalPages: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  readonly apiPageSize: number = 100;

  readonly itemsPerPageOptions: number[] = [
    5,
    10,
    20,
    50,
    100,
  ];

  /* =========================
     USER DETAIL
  ========================= */

  selectedUser: UserDto | null = null;
  showUserDetail = false;

  /* =========================
     FILTERS
  ========================= */

  lastFiltersUsed: {
    userId?: number;
    userRole?: UserRole;
    userStatus?: UserStatus;
    stageId?: number;
    comment?: boolean;
    alert?: boolean;
    newStudents?: boolean;
  } = {};

  constructor(
    private reportsService: ReportsService,
  ) {}

   ngOnInit(): void {
    this.fetchUsers();
  }

  /* =========================
     FILTER SUBMIT
  ========================= */

  handleFormSubmit(filters: {
    userId?: number;
    userRole?: UserRole;
    userStatus?: UserStatus;
    comment?: boolean;
    stageId?: number;
    alert?: boolean;
    newStudents?: boolean;
  }): void {
    this.lastFiltersUsed = filters;
    this.currentPage = 1;
    this.fetchUsers();
  }

  /* =========================
     PAGE CHANGE
  ========================= */

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.fetchUsers();
  }

  /* =========================
     FETCH
  ========================= */

  private fetchUsers(): void {
    const {
      userId,
      userRole,
      userStatus,
      comment,
      alert,
      newStudents,
      stageId
    } = this.lastFiltersUsed;

    const globalStart =
      (this.currentPage - 1) *
      this.itemsPerPage;

    const apiPage =
      Math.floor(
        globalStart /
        this.apiPageSize
      ) + 1;

    this.isLoading = true;

    this.reportsService
      .getUsersData(
        apiPage,
        userId,
        userRole,
        userStatus,
        stageId,
        comment,
        alert,
        newStudents
      )
      .subscribe({
        next: (response) => {
          this.users =
            response.users;

          this.totalUsers =
            response.totalCount;

          this.totalPages = Math.max(
            1,
            Math.ceil(
              this.totalUsers /
              this.itemsPerPage,
            ),
          );

          this.isLoading = false;
        },

        error: () => {
          this.isLoading = false;

          this.showModal(
            'No se pudo obtener la información del usuario.',
            {
              title: 'Error',
              isError: true
            }
          );
        }
      });
  }

  /* =========================
     STAGE HISTORY
  ========================= */

  handleStageClick(studentId: number): void {
    const selectedUser = this.users.find(
      u => u.student?.id === studentId
    );

    if (
      !selectedUser?.student?.stage ||
      !selectedUser.student.createdAt
    ) {
      this.showModal(
        'No hay información de stage disponible.',
        {
          title: 'Historial de Stages',
          isContentViewer: true,
        }
      );
      return;
    }

    const history =
      selectedUser.student.StudentAndStagesHistory;

    if (!history || history.length === 0) {
      const message =
        this.generateCurrentStageHtml(
          selectedUser.student.stage,
          selectedUser.student.createdAt
        );

      this.showModal(message, {
        title: 'Historial de Stages',
        isContentViewer: true,
      });

      return;
    }

    const sortedHistory =
      this.getSortedStageHistory(history);

    const message =
      this.generateStageHistoryHtml(
        sortedHistory
      );

    this.showModal(message, {
      title: 'Historial de Stages',
      isContentViewer: true,
    });
  }

  private generateCurrentStageHtml(
    stage: Stage,
    fromDate: string | Date
  ): string {
    const stageNumber = stage.number;
    const stageDescription = stage.description;

    const from =
      new Date(fromDate)
        .toLocaleDateString(
          'es-EC',
          {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }
        );

    return `
      <div class="stage-info-block">
        <div>${stageDescription}</div>
        <div>Desde: ${from}</div>
      </div>
    `;
  }

  private getSortedStageHistory(
    history: StudentStageHistory[]
  ): StudentStageHistory[] {
    return [...history].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }

  private generateStageHistoryHtml(
    history: StudentStageHistory[]
  ): string {
    let html = `<div class="stage-info-block">`;

    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      const next = history[i + 1];

      const stageNumber =
        current.stage?.number ||
        `STG ${current.stageId}`;

      const stageDescription =
        current.stage?.description || '';

      const fromDate =
        DateTime.fromISO(current.createdAt);

      const toDate =
        next
          ? DateTime.fromISO(next.createdAt)
          : null;

      const from =
        fromDate.toFormat('dd/MM/yyyy');

      const to =
        toDate
          ? toDate.toFormat('dd/MM/yyyy')
          : null;

      const daysBetween =
        toDate
          ? toDate.diff(fromDate, 'days').days
          : null;

      html += `
        <div class="stage-item">
          <div>${stageDescription}</div>
          <div>Desde: ${from}${to ? ` - Hasta: ${to}` : ''}</div>
          ${daysBetween ? `<div>Días transcurridos: ${Math.round(daysBetween)} días</div>` : ''}
          <br />
        </div>
      `;
    }

    html += `</div>`;

    return html;
  }

  /* =========================
     EXCEL
  ========================= */

  handleDownloadExcel(filters?: {
    userId?: number;
    userRole?: UserRole;
    userStatus?: UserStatus;
    comment?: boolean;
    alert?: boolean;
    newStudents?: boolean;
    stageId?: number;
  }): void {
    const {
      userId,
      userRole,
      userStatus,
      comment,
      alert,
      newStudents,
      stageId
    } =
      filters ||
      this.lastFiltersUsed;

    this.reportsService
      .getUsersDataExcel(
        this.currentPage,
        userId,
        userRole,
        userStatus,
        stageId,
        comment,
        alert,
        newStudents
      )
      .subscribe({
        next: (blob) => {
          const url =
            window.URL.createObjectURL(blob);

          const a =
            document.createElement('a');

          a.href = url;
          a.download = 'reporte_usuarios.xlsx';
          a.click();

          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error(
            'Error al descargar Excel:',
            error
          );
        },
      });
  }

  /* =========================
     NEW HEADER ACTIONS
  ========================= */

  handleGenerateReport(): void {
    this.currentPage = 1;
    this.fetchUsers();
  }

  /* =========================
     DETAIL
  ========================= */

  openUserDetail(user: UserDto): void {
    this.selectedUser = user;
    this.showUserDetail = true;
  }

  closeUserDetail(): void {
    this.selectedUser = null;
    this.showUserDetail = false;
  }

  /* =========================
     PAGINATION HELPERS
  ========================= */

  get canPrev(): boolean {
    return this.currentPage > 1;
  }

  get canNext(): boolean {
    return (
      this.currentPage <
      this.totalPages
    );
  }

  get startIndex(): number {
    if (!this.totalUsers) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.itemsPerPage
    ) + 1;
  }

  get endIndex(): number {
    return Math.min(
      this.currentPage *
      this.itemsPerPage,
      this.totalUsers
    );
  }

  get paginationLabel(): string {
    if (!this.totalUsers) {
      return '0 usuarios';
    }

    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.totalUsers} usuarios`
    );
  }

  handlePreviousPage(): void {
    if (!this.canPrev) {
      return;
    }

    this.handlePageChange(
      this.currentPage - 1
    );
  }

  handleNextPage(): void {
    if (!this.canNext) {
      return;
    }

    this.handlePageChange(
      this.currentPage + 1
    );
  }

  handleItemsPerPageChange(
    value: number,
  ): void {
    const limit = Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      return;
    }

    this.itemsPerPage = limit;
    this.currentPage = 1;

    this.totalPages = Math.max(
      1,
      Math.ceil(
        this.totalUsers /
        this.itemsPerPage,
      ),
    );

    this.fetchUsers();
  }


    get paginatedUsers(): UserDto[] {
    return this.users.slice(
      0,
      this.itemsPerPage
    );
  }

  /* =========================
     SUMMARY
  ========================= */

  get activeUsers(): number {
    return this.users.filter(
      user =>
        user.status === UserStatus.ACTIVE
    ).length;
  }

  get activeUsersPercentage(): number {
    if (!this.users.length) {
      return 0;
    }

    return Number(
      (
        this.activeUsers /
        this.users.length *
        100
      ).toFixed(1)
    );
  }

  get usersWithComments(): number {
    return this.users.filter(
      user =>
        this.getUserCommentsCount(user) > 0
    ).length;
  }

  get usersWithCommentsPercentage(): number {
    if (!this.users.length) {
      return 0;
    }

    return Number(
      (
        this.usersWithComments /
        this.users.length *
        100
      ).toFixed(1)
    );
  }

  get usersWithAlerts(): number {
    return this.users.filter(
      user =>
        this.getUserAlertsCount(user) > 0
    ).length;
  }

  get usersWithAlertsPercentage(): number {
    if (!this.users.length) {
      return 0;
    }

    return Number(
      (
        this.usersWithAlerts /
        this.users.length *
        100
      ).toFixed(1)
    );
  }

  get newStudents(): number {
    const limit =
      DateTime.now()
        .minus({ days: 7 });

    return this.users.filter(user => {
      if (
        !user.student ||
        !user.student.createdAt
      ) {
        return false;
      }

      const createdAt =
        typeof user.student.createdAt === 'string'
          ? DateTime.fromISO(
              user.student.createdAt
            )
          : DateTime.fromJSDate(
              new Date(
                user.student.createdAt
              )
            );

      return (
        createdAt.isValid &&
        createdAt >= limit
      );
    }).length;
  }

  /* =========================
     ROLE DISTRIBUTION
  ========================= */

  get studentsCount(): number {
    return this.users.filter(
      user =>
        user.role === UserRole.STUDENT
    ).length;
  }

  get instructorsCount(): number {
    return this.users.filter(
      user =>
        user.role === UserRole.INSTRUCTOR
    ).length;
  }

  get administratorsCount(): number {
    return this.users.filter(
      user =>
        user.role === UserRole.ADMIN
    ).length;
  }

  get otherRolesCount(): number {
    return Math.max(
      0,
      this.users.length -
      this.studentsCount -
      this.instructorsCount -
      this.administratorsCount
    );
  }

  /* =========================
     STATUS DISTRIBUTION
  ========================= */

  get inactiveUsers(): number {
    return this.users.filter(
      user =>
        user.status === UserStatus.INACTIVE
    ).length;
  }

  get suspendedUsers(): number {
    return this.users.filter(
      user =>
        user.status === UserStatus.HOLD ||
        user.status === UserStatus.BLOCK
    ).length;
  }

  /* =========================
     USER HELPERS
  ========================= */

  private getUserCommentsCount(
    user: UserDto
  ): number {
    const value =
      user as UserDto & {
        commentsCount?: number;
        commentCount?: number;
        comments?: unknown[];
      };

    return Number(
      value.commentsCount ??
      value.commentCount ??
      value.comments?.length ??
      0
    );
  }

  private getUserAlertsCount(
    user: UserDto
  ): number {
    const value =
      user as UserDto & {
        alertsCount?: number;
        alertCount?: number;
        alerts?: unknown[];
      };

    return Number(
      value.alertsCount ??
      value.alertCount ??
      value.alerts?.length ??
      0
    );
  }

  /* =========================
     MODAL
  ========================= */

  private showModal(
    message: string,
    options?: {
      title?: string;
      isError?: boolean;
      isSuccess?: boolean;
      isInfo?: boolean;
      isContentViewer?: boolean;
    }
  ): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      title: options?.title || '',
      isError: options?.isError ?? false,
      isSuccess: options?.isSuccess ?? false,
      isInfo: options?.isInfo ?? false,
      isContentViewer:
        options?.isContentViewer ?? false,
      close: () =>
        this.closeModal(),
    };

    if (
      !options?.isContentViewer
    ) {
      setTimeout(
        () =>
          this.closeModal(),
        3000
      );
    }
  }

  private closeModal(): void {
    this.modal = {
      ...modalInitializer()
    };
  }
}