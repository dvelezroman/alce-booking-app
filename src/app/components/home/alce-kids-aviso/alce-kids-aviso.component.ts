import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alce-kids-aviso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alce-kids-aviso.component.html',
  styleUrl: './alce-kids-aviso.component.scss'
})
export class AlceKidsAvisoComponent {

  @Input() show = false;

  @Output() closed = new EventEmitter<void>();

  readonly imageUrl =
    'https://bitflow-public.s3.us-east-1.amazonaws.com/aviso_suspension_clases_presenciales_portoviejo.jpeg';

  close(): void {
    this.closed.emit();
  }

}