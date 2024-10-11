import { Routes } from '@angular/router';
import { MeetingBookingComponent } from "./pages/meeting-booking/meeting-booking.component";
import { LoginComponent } from './pages/login/login.component';
import { RegisterCompleteComponent } from './pages/register-complete/register-complete.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { RegisterComponent } from "./pages/register/register.component";
import {StageComponent} from "./pages/stage/stage.component";
import { SearchingMeetingComponent } from './pages/searching-meeting/searching-meeting.component';
import { SearchingStudentComponent } from './pages/searching-students/searching-student.component';
import {AuthGuard} from "./auth/auth.guard";
import { SearchingMeetingInstructorComponent } from './pages/searching-meeting-instructor/searching-meeting-instructor.component';
import { LinksComponent } from './pages/links/links.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-complete', component: RegisterCompleteComponent, canActivate: [AuthGuard] },
  { path: 'booking', component: MeetingBookingComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent, canActivate: [AuthGuard]},
  { path: 'stage', component: StageComponent, canActivate: [AuthGuard] },
  { path: 'link', component: LinksComponent},
  { path: 'searching-meeting', component: SearchingMeetingComponent, canActivate: [AuthGuard]},
  { path: 'searching-meeting-instructor', component: SearchingMeetingInstructorComponent,canActivate: [AuthGuard]},
  { path: 'searching-students', component: SearchingStudentComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
