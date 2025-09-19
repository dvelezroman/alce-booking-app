import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';

import { DiffusionGroup } from '../../../services/dtos/whatsapp-diffusion-group.dto';
import { SelectionType } from '../broadcast-filters/broadcast-filters.component';
import { Group } from '../../../services/dtos/whatsapp-group.dto';
import { WhatsAppContact } from '../../../services/dtos/whatsapp-group.dto';
import { getInitials, translateWhatsappStatus } from '../../../shared/utils/capitalized.util';

interface UiItem {
  id: string;
  title: string;
  sub: string;
  phone?: string;
  fromWhatsapp?: boolean;
  avatar?: string;
}

@Component({
  selector: 'app-group-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-selector.component.html',
  styleUrls: ['./group-selector.component.scss'],
})
export class GroupSelectorComponent implements OnChanges {
  /** ======= Inputs desde el padre ======= */
  @Input() type: SelectionType = null;
  @Input() query: string | null = null;
  @Input() selectedGroupId: string | number | null = null;
  @Input() groups: Group[] = [];
  @Input() diffusionGroups: DiffusionGroup[] = [];
  @Input() contacts: WhatsAppContact[] = [];
  @Input() loading = false;
  @Input() title: string = 'Selecciona grupos';

  /** ======= Outputs hacia el padre ======= */
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() queryChange = new EventEmitter<string>();
  @Output() contactsSelected = new EventEmitter<{ id: string; name: string; phone?: string }[]>();

  /** ======= Estado interno (UI) ======= */
  available: UiItem[] = [];
  selectedIds: string[] = [];

  searchInput$ = new Subject<string>();

  getInitials = getInitials;  
  translateWhatsappStatus = translateWhatsappStatus;

  constructor() {
    this.searchInput$
      .pipe(debounceTime(500))
      .subscribe((term) => {
        this.queryChange.emit(term);
        this.buildAvailable();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['query']) {
      this.searchInput$.next(this.query || '');
    } else {
      this.buildAvailable();
    }
  }

  /** Construye lista visible según el tipo elegido */
  buildAvailable(): void {
    const q = (this.query || '').toLowerCase().trim();

    if (this.type === 'diffusion') {
      let list = this.diffusionGroups || [];
      if (this.selectedGroupId) {
        list = list.filter((g) => g.id === String(this.selectedGroupId));
      }
      if (q) {
        list = list.filter(
          (g) =>
            (g.name || '').toLowerCase().includes(q) ||
            (g.description || '').toLowerCase().includes(q)
        );
      }
      this.available = list.map((g) => ({
        id: g.id,
        title: `Difusión · ${g.name}`,
        sub: `${g.participantsCount} contactos`,
      }));
    } else if (this.type === 'group') {
      let list = this.groups || [];
      if (this.selectedGroupId) {
        list = list.filter((g) => g.id === String(this.selectedGroupId));
      }
      if (q) {
        list = list.filter(
          (g) =>
            (g.name || '').toLowerCase().includes(q) ||
            (g.description || '').toLowerCase().includes(q)
        );
      }
      this.available = list.map((g) => ({
        id: g.id,
        title: `Grupo · ${g.name}`,
        sub: `${g.participantsCount} miembros`,
      }));
    } else if (this.type === 'contact') {
      let list = this.contacts || [];
      if (q) {
        list = list.filter(
          (c) =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.pushname || '').toLowerCase().includes(q) ||
            (c.phone || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q)
        );
      }
      this.available = list.map((c) => ({
        id: c.id,
        title: c.name || c.pushname || c.phone,
        sub: c.email || c.status || 'Contacto',
        phone: c.phone,
        fromWhatsapp: !!c.fromWhatsapp, 
        avatar: c.profilePicUrl || undefined
      }));
    } else {
      this.available = [];
    }

    // limpiar seleccionados inválidos
    this.selectedIds = this.selectedIds.filter((id) =>
      this.available.some((a) => a.id === id)
    );
    this.selectionChange.emit(this.selectedIds);
    this.emitSelectedContacts();
  }

  /** Marca / desmarca un ítem */
  toggle(id: string, checked: boolean) {
    if (this.type === 'contact') {
      this.selectedIds = checked ? [id] : [];
    } else {
      const set = new Set(this.selectedIds);
      if (checked) set.add(id);
      else set.delete(id);
      this.selectedIds = Array.from(set);
    }

    this.selectionChange.emit(this.selectedIds);
    this.emitSelectedContacts();
  }

  private emitSelectedContacts() {
    const selectedContacts = this.available
      .filter((a) => this.selectedIds.includes(a.id))
      .map((a) => ({
        id: a.id,
        name: a.title,
        phone: a.phone,
      }));

    this.contactsSelected.emit(selectedContacts);
  }

  getContactDisplay(id: string): string {
    const item = this.available.find((v) => v.id === id);
    if (!item) return id;
    return item.title;
  }

  getGroupTitle(id: string): string {
    return this.available.find((v) => v.id === id)?.title || id;
  }

  getGroupSub(id: string): string {
    return this.available.find((v) => v.id === id)?.sub || '';
  }

  get selectedItems(): UiItem[] {
    return this.available.filter(a => this.selectedIds.includes(a.id));
  }
}