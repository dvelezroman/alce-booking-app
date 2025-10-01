import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maintenance-announcement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance-announcement.component.html',
  styleUrl: './maintenance-announcement.component.scss',
})
export class MaintenanceAnnouncementComponent implements OnInit {
  isVisible = false;

  ngOnInit(): void {
    const dismissed = localStorage.getItem('maintenanceAnnouncementDismissed');
    this.isVisible = dismissed !== 'true';
  }

  dismiss(): void {
    this.isVisible = false;
  }
}