import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupFormComponent } from '../../../../components/notifications/form-group/group-form.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, GroupFormComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent {
  groups: any[] = [];
  showModal = false;

  openCreateGroup() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onGroupCreated() {
    this.closeModal();
    this.loadGroups();
  }

  loadGroups() {
    // Aquí deberías hacer el fetch real, esto es solo placeholder
    console.log('Recargando grupos...');
  }
}