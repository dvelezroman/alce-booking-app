import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss'
})
export class ImageUploadComponent {

  @Input() image?: string;
  @Output() imageChange = new EventEmitter<string | undefined>();

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const url = URL.createObjectURL(file);
      this.imageChange.emit(url);
    }
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.imageChange.emit(undefined);
  }

  triggerInput(input: HTMLInputElement) {
    input.click();
  }
}