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

  @Output() completed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly videoId = '3eTkf_PKA7g';
  readonly contactPhone = '0999060380';

  videoSafeUrl!: SafeResourceUrl;

  hasStarted = false;
  countdown = 50;
  private timer?: any;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    if (!this.show) {
      this.reset();
    }
  }

  startVideo(): void {
    if (this.hasStarted) return;

    this.hasStarted = true;

    this.videoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.videoId}?autoplay=1&rel=0&modestbranding=1`
    );

    this.startCountdown();
  }

  private startCountdown(): void {
    this.timer = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.completed.emit();
      }
    }, 1000);
  }

  close(): void {
    if (!this.canClose) return;
    this.closed.emit();
  }

  private reset(): void {
    this.hasStarted = false;
    this.countdown = 50;
    clearInterval(this.timer);
  }
}