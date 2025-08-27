import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, HostListener } from '@angular/core';

export type PanelType = 'create' | 'groups' | 'notifications';
export type SendOptionType = 'user' | 'stage' | 'group';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.scss',
})
export class NotificationPanelComponent {
  activeTab: PanelType = 'create';
  dropdownOpen = false;

  @Output() actionSelected = new EventEmitter<PanelType>();
  @Output() sendOptionSelected = new EventEmitter<SendOptionType>();

  setActive(tab: PanelType) {
    this.activeTab = tab;
    this.dropdownOpen = false;
    this.actionSelected.emit(tab);
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Seleccionar opción del dropdown
  selectNotificationOption(option: SendOptionType, event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen = false;
    this.sendOptionSelected.emit(option);
  }

  @HostListener('document:click')
  closeDropdown() {
    this.dropdownOpen = false;
  }
}