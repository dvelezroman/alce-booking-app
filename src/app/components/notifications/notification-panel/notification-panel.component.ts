import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, HostListener, Input } from '@angular/core';
import { UserRole } from '../../../services/dtos/user.dto';

export type PanelType = 'create' | 'groups' | 'notifications';
export type SendOptionType = 'user' | 'stage' | 'group' | 'role';
export type NotificationsOptionType = 'sent';

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
  
  @Input() userRole: UserRole | null = null;
  protected readonly UserRole = UserRole;

  @Output() actionSelected = new EventEmitter<PanelType>();
  @Output() sendOptionSelected = new EventEmitter<SendOptionType>();

  ngOnInit() {
    this.actionSelected.emit(this.activeTab);
  }
  
  setActive(tab: PanelType) {
    this.activeTab = tab;
    this.dropdownOpen = false;
    this.actionSelected.emit(tab);
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectNotificationOption(option: SendOptionType, event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen = false;
    this.sendOptionSelected.emit(option);
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.dropdownOpen = false;
  }
}