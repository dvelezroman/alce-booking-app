import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
      CommonModule,
      RouterOutlet
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent {
  activeRoute: string = 'detailed';
  
  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.activeRoute = route;
    this.router.navigate([`/reports/${route}`]);
  }
}
