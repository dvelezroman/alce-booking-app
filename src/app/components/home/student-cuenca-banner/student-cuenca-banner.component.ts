import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-student-cuenca-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-cuenca-banner.component.html',
  styleUrl: './student-cuenca-banner.component.scss'
})
export class StudentCuencaBannerComponent {

  @Input() show = true;
  @Output() close = new EventEmitter<void>();

  googleMapsUrl =
    "https://www.google.com/maps/place/Ave+27+de+Febrero+270,+Cuenca/";

  closeModal() {
    this.close.emit();
  }

  openMaps() {
    window.open(this.googleMapsUrl, "_blank");
  }
}