import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group, WhatsAppContact } from '../../../services/dtos/whatsapp-group.dto';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
})
export class GroupDetailComponent {
  @Input() group: Group | null = null;
  @Input() contacts: WhatsAppContact[] = [];
}