import { Routes } from '@angular/router';
import { HomePublicComponent } from './pages/home-public/home-public.component';
import { dashboardRoutes } from './pages/dashboard/dashboard-routes';
import { DashboardLayoutComponent } from './pages/dashboard/dashboard-layout/dashboard-layout.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { AuthGuard } from './pages/auth/auth.guard';


export const routes: Routes = [
  { path: 'home', component: HomePublicComponent },
  { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: dashboardRoutes
  },

  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];