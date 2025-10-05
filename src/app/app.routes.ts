import { Routes } from '@angular/router';
import { HomePublicComponent } from './pages/home-public/home-public.component';
import { dashboardRoutes } from './pages/dashboard/dashboard-routes';
import { DashboardLayoutComponent } from './pages/dashboard/dashboard-layout/dashboard-layout.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { AuthGuard } from './pages/auth/auth.guard';
import { LoginGuard } from './pages/auth/login.guard';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';


export const routes: Routes = [
  { path: 'home-public', component: HomePublicComponent, canActivate: [LoginGuard] },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  // { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: dashboardRoutes
  },

  { path: '', redirectTo: '/home-public', pathMatch: 'full' },
  { path: '**', redirectTo: '/home-public' },
];