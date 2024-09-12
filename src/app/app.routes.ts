import { Routes } from '@angular/router';
import {MeetingBookingComponent} from "./pages/meeting-booking/meeting-booking.component";
import { LoginComponent } from './pages/login/login.component';
import { RegisterCompleteComponent } from './pages/register-complete/register-complete.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterCompleteComponent },
  { path: 'booking', component: MeetingBookingComponent },
  { path: 'contact', component: ContactComponent},
  { path: '**', redirectTo: '/home' }
];
