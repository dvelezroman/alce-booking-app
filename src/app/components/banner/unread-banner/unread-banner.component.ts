import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  Router,
} from '@angular/router';


@Component({
  selector: 'app-unread-banner',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './unread-banner.component.html',
  styleUrls: ['./unread-banner.component.scss'],
})
export class UnreadBannerComponent implements OnChanges, OnDestroy {

  @Input() count: number = 0;

  @Input() showDurationMs = 10_000;


  visible = false;


  private showTimer?: ReturnType<typeof setTimeout>;

  private hideTimer?: ReturnType<typeof setTimeout>;


  constructor(
    private router: Router,
  ) {}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['count']) {
      this.resetTimer();
    }
  }


  ngOnDestroy(): void {
    this.clearTimers();
  }


  private resetTimer(): void {
    this.clearTimers();

    if (this.count <= 0) {
      this.visible = false;
      return;
    }

    this.visible = false;

    /*
     * Espera 6 segundos antes de mostrar
     * el banner de notificaciones.
     */
    this.showTimer = setTimeout(() => {

      this.visible = true;

      /*
       * Luego de mostrarse, permanece visible
       * durante el tiempo configurado.
       */
      this.hideTimer = setTimeout(() => {
        this.visible = false;
      }, this.showDurationMs);

    }, 8000);
  }


  close(): void {
    this.visible = false;

    this.clearTimers();
  }


  goToNotifications(): void {
    this.visible = false;

    this.clearTimers();

    this.router.navigate([
      '/dashboard/notifications-inbox',
    ]);
  }


  private clearTimers(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }

}