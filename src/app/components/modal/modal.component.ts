import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgClass, NgIf} from "@angular/common";
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Input() showModal: boolean = false;
  @Input() message: string | SafeHtml = 'An error occurred'; // Default message
  @Input() isError: boolean = true;  // Flag to determine error or success
  @Input() isSuccess: boolean = false;  // Success flag for success message
  @Output() confirmAction = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Input() showButtons: boolean = false;
  @Input() isInfo: boolean = false; 
  @Input() isContentViewer: boolean = false; 
  @Input() isMetadataViewer: boolean = false;
  @Input() metadata: any = null;
  @Input() title: string = '';
  shake: boolean = false;

  ngOnChanges() {
    if (this.isError && this.showModal) {
      this.shake = true;
      setTimeout(() => {
        this.shake = false;
      }, 500); 
    }
  }

  confirm() {
    this.confirmAction.emit(); 
  }
  
  closeModal() {
    this.showModal = false;
    this.close.emit();  // Notify parent component to close the modal
  }
}
