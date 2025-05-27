import { Routes } from '@angular/router';

import { AssessmentComponent } from './assessment/assessment.component';
import { AssessmentReportsComponent } from './assessment-reports/assessment-reports.component';
import { AttendanceInstructorComponent } from './attendance-instructor/attendance-instructor.component';
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
import { ReportsDetailedComponent } from './reports-detail-statist-meeting/reports-detailed.component';
import { ReportsProgressComponent } from './reports-progress/reports-progress.component';
import { SearchingMeetingInstructorComponent } from './searching-meeting-instructor/searching-meeting-instructor.component';
import { SearchingMeetingComponent } from './searching-meeting/searching-meeting.component';
import { SearchingStudentComponent } from './searching-students/searching-student.component';
import { StageComponent } from './stage/stage.component';
import { AcademicResourcesComponent } from './academic-resources/academic-resources.component';

export const dashboardRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePrivateComponent },
  { path: 'register-complete', component: RegisterCompleteComponent },
  { path: 'booking', component: MeetingBookingComponent },
  { path: 'stage', component: StageComponent },
  { path: 'link', component: LinksComponent },
  { path: 'content', component: ContentComponent },
  { path: 'recursos', component: AcademicResourcesComponent },
  { path: 'meetings-student', component: MeetingsStudentComponent },
  { path: 'searching-meeting', component: SearchingMeetingComponent },
  { path: 'searching-meeting-instructor', component: SearchingMeetingInstructorComponent },
  { path: 'searching-students', component: SearchingStudentComponent },
  { path: 'asistencias-alumnos', component: AttendanceReportsComponent },
  { path: 'asistencias-instructor', component: AttendanceInstructorComponent },
  { path: 'feature-flag', component: FeatureFlagComponent },
  { path: 'create-students', component: RegisterStudentComponent },
  { path: 'create-instructors', component: RegisterInstructorAdminComponent },
  { path: 'reports-detailed', component: ReportsDetailedComponent },
  { path: 'reports-progress', component: ReportsProgressComponent },
  { path: 'assessment', component: AssessmentComponent },
  { path: 'assessment-reports', component: AssessmentReportsComponent },
  { path: 'processed-events', component: ProcessedEventsComponent },
];