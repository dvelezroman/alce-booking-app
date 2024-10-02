import { Routes } from '@angular/router';
import { MeetingBookingComponent } from "./pages/meeting-booking/meeting-booking.component";
import { LoginComponent } from './pages/login/login.component';
import { RegisterCompleteComponent } from './pages/register-complete/register-complete.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { RegisterComponent } from "./pages/register/register.component";
import {StageComponent} from "./pages/stage/stage.component";
import {MeetingUpdateLinkComponent} from "./pages/meeting-update-link/meeting-update-link.component";
import { SearchingMeetingComponent } from './pages/searching-meeting/searching-meeting.component';
import { SearchingStudentComponent } from './pages/searching-students/searching-student.component';
import {SearchingStudent2Component} from "./pages/searching-student-2/searching-student-2.component";

export const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-complete', component: RegisterCompleteComponent },
  { path: 'booking', component: MeetingBookingComponent },
  { path: 'contact', component: ContactComponent},
  { path: 'stage', component: StageComponent },
  { path: 'meeting-update-link', component: MeetingUpdateLinkComponent },
  { path: 'searching-meeting', component: SearchingMeetingComponent},
  { path: 'searching-students', component: SearchingStudentComponent},
  { path: 'searching-students-2', component: SearchingStudent2Component},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
