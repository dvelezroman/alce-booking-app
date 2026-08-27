import { Routes } from '@angular/router';

import { AssessmentComponent } from './assessment/assessment.component';
import { AssessmentReportsComponent } from './assessment-reports/assessment-reports.component';
import { ReportInstructorComponent } from './report-instructor/report-instructor.component';
import { AttendanceReportsComponent } from './attendance-reports/attendance-reports.component';
import { ContentComponent } from './content/content.component';
import { FeatureFlagComponent } from './feature-flag/feature-flag.component';
import { HomePrivateComponent } from './home/home.component';
import { LinksComponent } from './links/links.component';
import { MeetingBookingComponent } from './meeting-booking/meeting-booking.component';
import { MeetingsStudentComponent } from './meetings-student/meetings-student.component';
import { ProcessedEventsComponent } from './processed-events/processed-events.component';
import { RegisterCompleteComponent } from './register-complete/register-complete.component';
import { RegisterInstructorAdminComponent } from './register-instructor-admin/register-instructor-admin.component';
import { RegisterStudentComponent } from './register-student/register-student.component';
import { ReportsDetailedComponent } from './report-students/reports-detailed.component';
import { ReportsProgressComponent } from './report-progress/reports-progress.component';
import { SearchingMeetingInstructorComponent } from './searching-meeting-instructor/searching-meeting-instructor.component';
import { SearchingMeetingComponent } from './searching-meeting/searching-meeting.component';
import { SearchingStudentComponent } from './searching-students/searching-student.component';
import { StageComponent } from './stage/stage.component';
import { AcademicResourcesComponent } from './academic-resources/academic-resources.component';
import { AssessmentTypesComponent } from './assessment-types/assessment-types.component';
import { AssessmentConfigComponent } from './assessment-config/assessment-config.component';
import { AdminReportRecipientsComponent } from './admin-report-recipients/admin-report-recipients.component';
import { StagePromotionConfigComponent } from './stage-promotion-config/stage-promotion-config.component';
import { ReportUserComponent } from './report-user/report-user.component';
import { AttendanceInstructorComponent } from './attendance-instructor/attendance-instructor.component';
import { BroadcastGroupsComponent } from './notifications/broadcast-groups/broadcast-groups.component';
import { NotificationsStatusComponent } from './notifications/notifications-status/notifications-status.component';
import { GroupsComponent } from './notifications/groups/groups.component';
import { InboxComponent } from './notifications/inbox/inbox.component';
import { NotificationDetailComponent } from './notifications/notification-detail/notification-detail.component';
import { NotificationsSentComponent } from './notifications/notifications-sent/notifications-sent.component';
import { SendEmailsComponent } from './emails/send-emails/send-emails.component';
import { HistorialEmailComponent } from './emails/historial-email/historial-email.component';
import { SuppressedEmailsComponent } from './emails/suppressed-emails/suppressed-emails.component';
import { InboxEmailComponent } from './emails/inbox-email/inbox-email.component';
import { SentEmailComponent } from './emails/sent-email/sent-email.component';
import { EmailDetailComponent } from './emails/email-detail/email-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { ReportsExcelPageComponent } from './reports-excel-page/reports-excel-page.component';
import { StageAssessmentComponent } from './stage-assessment/stage-assessment.component';
import { StageAssessmentResourcesComponent } from './stage-assessment-resources/stage-assessment-resources.component';
import { StageAssessmentStudentComponent } from './stage-assessment-student/stage-assessment-student.component';
import { PlatformAssessmentsStudentComponent } from './platform-assessments-student/platform-assessments-student.component';
import { PlatformAssessmentsListComponent } from './platform-assessments-list/platform-assessments-list.component';
import { PlatformAssessmentsAssignComponent } from './platform-assessments-assign/platform-assessments-assign.component';
import { PlatformAssessmentsTemplatesComponent } from './platform-assessments-templates/platform-assessments-templates.component';
import { PlatformAssessmentsTemplateDetailComponent } from './platform-assessments-template-detail/platform-assessments-template-detail.component';
import { StageAssessmentListComponent } from './stage-assessment-list/stage-assessment-list.component';
import { SuspensionHistoryComponent } from './suspension-history/suspension-history.component';
import { InstructorEvaluationsComponent } from './instructor-evaluations/instructor-evaluations.component';
import { MeetingEvaluationsComponent } from './meeting-evaluations/meeting-evaluations.component';
import { EvaluationStatisticsComponent } from './evaluation-statistics/evaluation-statistics.component';
import { StudentHistoryReportComponent } from './report-students/student-history-report/student-history-report.component';
import { ActiveStudentsReportComponent } from './report-students/active-students-report/active-students-report.component';
import { InstructorCreatedMeetingsComponent } from './instructor-created-meetings/instructor-created-meetings.component';
import { AnnouncementsComponent } from './announcements/announcements.component';
import { adminOnlyGuard } from '../auth/admin-role.guard';
import { instructorOnlyGuard } from '../auth/instructor-role.guard';
import { AdminLeadSchedulingDetailComponent } from './admin/lead-scheduling-requests/admin-lead-scheduling-detail.component';
import { AdminLeadSchedulingListComponent } from './admin/lead-scheduling-requests/admin-lead-scheduling-list.component';
import { InstructorLeadSchedulingDetailComponent } from './instructor/lead-scheduling-requests/instructor-lead-scheduling-detail.component';
import { InstructorLeadSchedulingListComponent } from './instructor/lead-scheduling-requests/instructor-lead-scheduling-list.component';
import { WhatsappNotificadorComponent } from './admin/whatsapp-notificador/whatsapp-notificador.component';
import { WhatsappCampaignHistoryComponent } from './admin/whatsapp-campaigns/whatsapp-campaign-history.component';
import { WhatsappCampaignDetailComponent } from './admin/whatsapp-campaigns/whatsapp-campaign-detail.component';
import { ScheduledMeetingsComponent } from './scheduled-meetings/scheduled-meetings.component';
import { MeetingBookingV2Component } from './meeting-booking-v2/meeting-booking-v2.component';
import { NotificationDetailV2Component } from './notifications/notification-detail-v2/notification-detail-v2.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { SearchingMeetingInstructorV2Component } from './searching-meeting-instructor-v2/searching-meeting-instructor-v2.component';
import { ReportsProgressV2Component } from './report-progress-v2/reports-progress-v2.component';
import { BroadcastGroupsV2Component } from './notifications/broadcast-groups-v2/broadcast-groups-v2.component';
import { NotificationsSentV2Component } from './notifications/notifications-sent-v2/notifications-sent-v2.component';
import { NotificationsHistorialComponent } from './notifications/notifications-historial/notifications-historial.component';
import { SearchingMeetingV2Component } from './searching-meeting-v2/searching-meeting-v2.component';
import { SearchingUserComponent } from './searching-user/searching-user.component';
import { AttendanceStudentComponent } from './attendance-student/attendance-student.component';
import { AttendanceInstructorV2Component } from './attendance-instructor-v2/attendance-instructor-v2.component';
import { RegisterStudentV2Component } from './register-student-v2/register-student-v2.component';
import { RegisterStaffComponent } from './register-staff/register-staff.component';
import { StageAssessmentV2Component } from './stage-assessment-v2/stage-assessment-v2.component';
import { NotificationSettingsComponent } from '../../components/notification-settings/notification-settings.component';
import { FeatureFlagV2Component } from './feature-flag-v2/feature-flag-v2.component';

const dashboardChildren: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePrivateComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'register-complete', component: RegisterCompleteComponent },
  { path: 'booking', component: MeetingBookingComponent },
  { path: 'booking-v2', component: MeetingBookingV2Component },
  { path: 'stage', component: StageComponent },
  { path: 'link', component: LinksComponent },
  { path: 'content', component: ContentComponent },
  { path: 'resources', component: AcademicResourcesComponent },
  { path: 'stage-assessment-resources', component: StageAssessmentResourcesComponent },
  { path: 'assessment-types', component: AssessmentTypesComponent },
  { path: 'meetings-student', component: MeetingsStudentComponent },
  { path: 'scheduled-meetings', component: ScheduledMeetingsComponent },
  { path: 'meeting-evaluations', component: MeetingEvaluationsComponent },
  { path: 'evaluation-statistics', component: EvaluationStatisticsComponent },
  { path: 'searching-meeting', component: SearchingMeetingComponent },
  { path: 'searching-meeting-v2', component: SearchingMeetingV2Component },
  { path: 'searching-meeting-instructor', component: SearchingMeetingInstructorComponent },
  { path: 'searching-meeting-instructor-v2', component: SearchingMeetingInstructorV2Component },
  {
    path: 'admin',
    canActivate: [adminOnlyGuard],
    children: [
      {
        path: 'lead-scheduling-requests',
        component: AdminLeadSchedulingListComponent,
      },
      {
        path: 'lead-scheduling-requests/:id',
        component: AdminLeadSchedulingDetailComponent,
      },
      {
        path: 'whatsapp-notificador',
        component: WhatsappNotificadorComponent,
      },
      {
        path: 'whatsapp-campaigns',
        component: WhatsappCampaignHistoryComponent,
      },
      {
        path: 'whatsapp-campaigns/:batchId',
        component: WhatsappCampaignDetailComponent,
      },
    ],
  },
  {
    path: 'instructor',
    canActivate: [instructorOnlyGuard],
    children: [
      {
        path: 'lead-scheduling-requests',
        component: InstructorLeadSchedulingListComponent,
      },
      {
        path: 'lead-scheduling-requests/:id',
        component: InstructorLeadSchedulingDetailComponent,
      },
    ],
  },
  { path: 'searching-students', component: SearchingStudentComponent },
  { path: 'searching-user', component: SearchingUserComponent },
  // { path: 'attendance-student', component: AttendanceReportsComponent },
  { path: 'attendance-student', component: AttendanceStudentComponent },
  { path: 'report-instructor', component: ReportInstructorComponent },
  { path: 'instructor-created-meetings', component: InstructorCreatedMeetingsComponent },
  { path: 'attendance-instructor', component: AttendanceInstructorComponent },
  { path: 'attendance-instructor-v2', component: AttendanceInstructorV2Component },
  { path: 'instructor-evaluations', component: InstructorEvaluationsComponent },
  // { path: 'feature-flag', component: FeatureFlagComponent },
  { path: 'feature-flag-v2', component: FeatureFlagV2Component },
  { path: 'announcements', component: AnnouncementsComponent },
  // { path: 'create-students', component: RegisterStudentComponent },
  { path: 'create-students', component: RegisterStudentV2Component },
  // { path: 'create-instructors', component: RegisterInstructorAdminComponent },
  { path: 'create-staff', component: RegisterStaffComponent },
  { path: 'reports-detailed', component: ReportsDetailedComponent },
  { path: 'student-history-report', component: StudentHistoryReportComponent },
  { path: 'active-students-report', component: ActiveStudentsReportComponent },
  // { path: 'reports-progress', component: ReportsProgressComponent },
  { path: 'reports-progress-v2', component: ReportsProgressV2Component },
  { path: 'suspension-history', component: SuspensionHistoryComponent },
  { path: 'report-user', component: ReportUserComponent },
  { path: 'report-excel', component: ReportsExcelPageComponent },
  { path: 'broadcast-groups', component: BroadcastGroupsComponent },
  { path: 'broadcast-groups-v2', component: BroadcastGroupsV2Component },
  { path: 'assessment', component: AssessmentComponent },
  { path: 'assessment-reports', component: AssessmentReportsComponent },
  { path: 'assessment-config', component: AssessmentConfigComponent },
  // { path: 'stage-assessment', component: StageAssessmentComponent },
  { path: 'stage-assessment', component: StageAssessmentV2Component },
  { path: 'stage-assessment-list', component: StageAssessmentListComponent },
  { path: 'stage-assessment-student', component: StageAssessmentStudentComponent },
  { path: 'platform-assessments', component: PlatformAssessmentsStudentComponent },
  { path: 'platform-assessments-list', component: PlatformAssessmentsListComponent },
  { path: 'platform-assessments-assign', component: PlatformAssessmentsAssignComponent },
  { path: 'platform-assessments-templates', component: PlatformAssessmentsTemplatesComponent },
  { path: 'platform-assessments-templates/:templateId', component: PlatformAssessmentsTemplateDetailComponent },
  { path: 'processed-events', component: ProcessedEventsComponent },
  { path: 'notifications-status', component: NotificationsStatusComponent },
  { path: 'notifications-historial', component: NotificationsHistorialComponent },
  { path: 'notifications-groups', component: GroupsComponent },
  { path: 'notifications-inbox', component: InboxComponent },
  { path: 'notification-settings', component: NotificationSettingsComponent },
  { path: 'notifications', component: NotificationSettingsComponent },
  { path: 'notifications-detail', component: NotificationDetailComponent },
  { path: 'notifications-detail-v2', component: NotificationDetailV2Component },
  { path: 'notifications-sent', component: NotificationsSentComponent },
  { path: 'notifications-sent-v2', component: NotificationsSentV2Component },
  { path: 'send-emails', component: SendEmailsComponent },
  { path: 'sent-email', component: SentEmailComponent },
  { path: 'inbox-email', component: InboxEmailComponent },
  { path: 'historial-email', component: HistorialEmailComponent },
  { path: 'suppressed-emails', component: SuppressedEmailsComponent },
  { path: 'email-detail', component: EmailDetailComponent },
];

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: dashboardChildren,
  },
];
