import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-snowfall',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snowfall.component.html',
  styleUrl: './snowfall.component.scss'
})

export class SnowfallComponent implements OnInit {
  flakes = Array.from({ length: 90 });

  ngOnInit() {
    setTimeout(() => this.randomizeFlakes(), 0);
  }

  randomizeFlakes() {
    const flakes = document.querySelectorAll('.snowflake');

    flakes.forEach((flake: any) => {
      const size = Math.random() * 4 + 2;
      const duration = Math.random() * 10 + 8;
      const delay = Math.random() * 10;
      const left = Math.random() * 100;

      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.left = `${left}vw`;
      flake.style.animationDuration = `${duration}s`;
      flake.style.animationDelay = `${delay}s`;
      flake.style.opacity = Math.random() * 0.6 + 0.3;
    });
  }
}
