import { Routes } from '@angular/router';
import { MeetingBookingComponent } from "./pages/meeting-booking/meeting-booking.component";
import { LoginComponent } from './pages/login/login.component';
import { RegisterCompleteComponent } from './pages/register-complete/register-complete.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from "./pages/register/register.component";
import { StageComponent } from "./pages/stage/stage.component";
import { SearchingMeetingComponent } from './pages/searching-meeting/searching-meeting.component';
import { SearchingStudentComponent } from './pages/searching-students/searching-student.component';
import { AuthGuard } from "./auth/auth.guard";
import { SearchingMeetingInstructorComponent } from './pages/searching-meeting-instructor/searching-meeting-instructor.component';
import { LinksComponent } from './pages/links/links.component';
import { AttendanceReportsComponent } from './pages/attendance-reports/attendance-reports.component';
import { AttendanceInstructorComponent } from './pages/attendance-instructor/attendance-instructor.component';
import { FeatureFlagComponent } from "./pages/feature-flag/feature-flag.component";
import { RegisterStudentComponent } from './pages/register-student/register-student.component';
import { RegisterInstructorAdminComponent } from './pages/register-instructor-admin/register-instructor-admin.component';
import { ReportesComponent } from './pages/reports/reportes.component';
import { ReportsDetailedComponent } from './pages/reports-detail-statist-meeting/reports-detailed.component';
import { MeetingsStudentComponent } from './pages/meetings-student/meetings-student.component';
import { ProcessedEventsComponent } from './pages/processed-events/processed-events.component';



export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-complete', component: RegisterCompleteComponent, canActivate: [AuthGuard] },
  { path: 'booking', component: MeetingBookingComponent, canActivate: [AuthGuard] },
  { path: 'stage', component: StageComponent, canActivate: [AuthGuard] },
  { path: 'link', component: LinksComponent},
  { path: 'meetings-student', component: MeetingsStudentComponent, canActivate: [AuthGuard] },
  { path: 'searching-meeting', component: SearchingMeetingComponent, canActivate: [AuthGuard]},
  { path: 'searching-meeting-instructor', component: SearchingMeetingInstructorComponent,canActivate: [AuthGuard]},
  { path: 'searching-students', component: SearchingStudentComponent, canActivate: [AuthGuard]},
  { path: 'asistencias-alumnos', component: AttendanceReportsComponent, canActivate: [AuthGuard]},
  { path: 'asistencias-instructor', component: AttendanceInstructorComponent, canActivate: [AuthGuard]},
  { path: 'processed-events', component: ProcessedEventsComponent, canActivate: [AuthGuard] },
  { path: 'feature-flag', component: FeatureFlagComponent, canActivate: [AuthGuard]},
  { path: 'create-students', component: RegisterStudentComponent, canActivate: [AuthGuard]},
  { path: 'create-instructors', component: RegisterInstructorAdminComponent, canActivate: [AuthGuard]},
  { 
    path: 'reports', 
    component: ReportesComponent, 
    canActivate: [AuthGuard], 
    children: [
      { path: 'detailed', component: ReportsDetailedComponent },
      { path: '', redirectTo: 'detailed', pathMatch: 'full' },
    ]
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
