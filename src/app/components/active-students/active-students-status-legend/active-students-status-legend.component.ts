import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-active-students-status-legend',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './active-students-status-legend.component.html',
  styleUrl: './active-students-status-legend.component.scss',
})
export class ActiveStudentsStatusLegendComponent {}