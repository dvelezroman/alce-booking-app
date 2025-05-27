import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-public',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-public.component.html',
  styleUrl: './home-public.component.scss'
})
export class HomePublicComponent {}