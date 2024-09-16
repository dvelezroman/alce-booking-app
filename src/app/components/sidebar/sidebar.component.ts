import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isSidebarClosed = false;

  openSidebar(event: Event) {
    event.stopPropagation(); 
    this.isSidebarClosed = false; 
  }

  @HostListener('document:click', ['$event'])
  closeSidebar(event: Event) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !sidebar.contains(event.target as Node)) {
      this.isSidebarClosed = true; 
    }
  }
}
