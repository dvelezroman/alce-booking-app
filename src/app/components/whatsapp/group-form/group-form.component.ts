import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact, Group } from '../../../services/dtos/whatsapp-group.dto';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.scss'],
})
export class GroupFormComponent implements OnInit, OnChanges {
  @Input() contacts: Contact[] = [];
  @Input() group: Group | null = null;
  @Output() close = new EventEmitter<void>();

  groupName = '';
  description = '';
  selectedContactId: string | null = null;
  selectedContacts: Contact[] = [];

  ngOnInit(): void {
    if (this.group) {
      this.loadGroupData(this.group);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['group'] && this.group) {
      this.loadGroupData(this.group);
    }
  }

  private loadGroupData(group: Group) {
    this.groupName = group.name;
    this.description = group.description;
    this.selectedContacts = this.contacts.filter(c =>
      group.members.includes(c.id)
    );
  }

  onSelectChange() {
    const contact = this.contacts.find(c => c.id === this.selectedContactId);
    if (contact && !this.selectedContacts.some(sc => sc.id === contact.id)) {
      this.selectedContacts.push(contact);
    }
    this.selectedContactId = null;
  }

  removeContact(id: string) {
    this.selectedContacts = this.selectedContacts.filter(c => c.id !== id);
  }

  onSubmit() {
    console.log('Grupo guardado:', {
      id: this.group?.id || '(nuevo)',
      name: this.groupName,
      desc: this.description,
      members: this.selectedContacts.map(c => c.id),
    });

    this.resetForm();
    this.close.emit();
  }

  onCancel() {
    this.resetForm();
    this.close.emit();
  }

  private resetForm() {
    this.groupName = '';
    this.description = '';
    this.selectedContactId = null;
    this.selectedContacts = [];
  }
}