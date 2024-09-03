import { Routes } from '@angular/router';
import {MeetingBookingComponent} from "./meeting-booking/meeting-booking.component";
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'booking', component: MeetingBookingComponent },
  { path: '**', redirectTo: '/login' }
];
