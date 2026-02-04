import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-student-intro-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-intro-video.component.html',
  styleUrl: './student-intro-video.component.scss'
})
export class StudentIntroVideoComponent implements OnChanges {

  @Input() show = false;
  @Input() canClose = false;

  /** cuando ya pasaron los 50s */
  @Output() completed = new EventEmitter<void>();

  /** cuando el usuario cierra */
  @Output() closed = new EventEmitter<void>();

  readonly videoId = '3eTkf_PKA7g';
  readonly contactPhone = '0999060380';

  videoSafeUrl: SafeResourceUrl;

  private timerStarted = false;

  constructor(private sanitizer: DomSanitizer) {
    this.videoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.videoId}?rel=0&modestbranding=1`
    );
  }

  ngOnChanges(): void {
    // SOLO si es primera vez
    if (this.show && !this.canClose && !this.timerStarted) {
      this.timerStarted = true;

      setTimeout(() => {
        this.completed.emit();
      }, 50000); // 50 segundos
    }
  }

  close(): void {
    if (!this.canClose) return;
    this.closed.emit();
  }
}