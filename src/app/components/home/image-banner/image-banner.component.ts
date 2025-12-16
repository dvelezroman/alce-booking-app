import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-image-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-banner.component.html',
  styleUrls: ['./image-banner.component.scss']
})
export class ImageBannerComponent {
  @Input() imageSrc!: string;
  @Input() alt = 'Banner';
  @Output() close = new EventEmitter<void>();

  closeBanner() {
    this.close.emit();
  }
}