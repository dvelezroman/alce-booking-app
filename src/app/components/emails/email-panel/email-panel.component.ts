import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, HostListener, Input } from '@angular/core';
import { UserRole } from '../../../services/dtos/user.dto';

export type EmailPanelType = 'create' | 'groups' | 'emails';
export type SendEmailOptionType = 'user' | 'stage' | 'group' | 'role';

@Component({
  selector: 'app-email-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-panel.component.html',
  styleUrl: './email-panel.component.scss',
})
export class EmailPanelComponent {
  activeTab: EmailPanelType = 'create';
  dropdownOpen = false;

  @Input() userRole: UserRole | null = null;
  protected readonly UserRole = UserRole;

  @Output() actionSelected = new EventEmitter<EmailPanelType>();
  @Output() sendOptionSelected = new EventEmitter<SendEmailOptionType>();

  ngOnInit() {
    this.actionSelected.emit(this.activeTab);
  }

  setActive(tab: EmailPanelType) {
    this.activeTab = tab;
    this.dropdownOpen = false;
    this.actionSelected.emit(tab);
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectEmailOption(option: string | null, event: Event) {
    event.stopPropagation();
    this.dropdownOpen = false;
    if (!option) return; // seguridad
    this.sendOptionSelected.emit(option as 'user' | 'stage' | 'group' | 'role');
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.dropdownOpen = false;
  }

  
}