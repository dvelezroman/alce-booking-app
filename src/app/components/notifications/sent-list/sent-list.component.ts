import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../../services/dtos/notification.dto';

@Component({
  selector: 'app-sent-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sent-list.component.html',
  styleUrl: './sent-list.component.scss'
})
export class SentListComponent {
  @Input() items: Notification[] = [];

  typeMap: Record<string, string> = {
    Announce: 'Anuncio',
    Advice: 'Consejo',
    Commentary: 'Comentario',
    Mandatory: 'Obligatorio',
    System: 'Sistema',
    Meeting: 'Reunión',
    Assessment: 'Evaluación',
  };

  statusMap: Record<string, string> = {
    PENDING: 'Pendiente',
    SENT: 'Enviado',
    DELIVERED: 'Entregado',
    READ: 'Leído',
    FAILED: 'Fallido',
  };

  priorityMap: Record<number, string> = {
    0: 'Baja',
    1: 'Normal',
    2: 'Alta',
    3: 'Urgente',
  };

  trackById(index: number, n: Notification): number {
    return n.id;
  }
}