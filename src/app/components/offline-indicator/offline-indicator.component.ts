import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!isOnline" class="offline-indicator">
      <div class="offline-indicator__card">

        <div class="offline-indicator__icon">
          <i class="material-icons">wifi_off</i>
        </div>

        <div class="offline-indicator__divider"></div>

        <div class="offline-indicator__content">
          <strong>Estás sin conexión</strong>
          <span>
            Algunas funciones pueden estar limitadas hasta que
            se restablezca tu conexión a internet.
          </span>
        </div>

        <div class="offline-indicator__status">
          <span class="offline-indicator__pulse"></span>
          <span>Reconectando...</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* =========================================================
       WRAPPER
    ========================================================= */

    .offline-indicator {
      position: fixed;
      top: 1rem;
      left: 50%;
      width: min(calc(100% - 2rem), 900px);
      z-index: 1001;
      transform: translateX(-50%);
      animation: offline-slide-down .28s ease-out;
    }

    /* =========================================================
       CARD
    ========================================================= */

    .offline-indicator__card {
      position: relative;
      width: 100%;
      min-height: 5.2rem;
      padding: .85rem 1rem;
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr) auto;
      align-items: center;
      gap: .85rem;
      overflow: hidden;
      box-sizing: border-box;
      border: 1px solid rgba(223, 135, 28, .45);
      border-radius: 1rem;
      color: #fff;
      background:
        linear-gradient(
          135deg,
          #ff9b21 0%,
          #ff8b14 55%,
          #f47c0a 100%
        );
      box-shadow:
        0 .8rem 2rem rgba(190, 103, 13, .22),
        0 .2rem .6rem rgba(190, 103, 13, .12);
    }

    .offline-indicator__card::before {
      content: '';
      position: absolute;
      top: -3.5rem;
      right: 10%;
      width: 11rem;
      height: 11rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, .07);
    }

    .offline-indicator__card::after {
      content: '';
      position: absolute;
      right: .9rem;
      bottom: .55rem;
      width: 3.4rem;
      height: 2rem;
      opacity: .32;
      background-image:
        radial-gradient(circle, rgba(255, 255, 255, .9) 1.2px, transparent 1.2px);
      background-size: .55rem .55rem;
    }

    /* =========================================================
       ICON
    ========================================================= */

    .offline-indicator__icon {
      position: relative;
      z-index: 2;
      width: 3.5rem;
      height: 3.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, .2);
      border-radius: 50%;
      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, .2),
          rgba(255, 255, 255, .08)
        );
      box-shadow:
        0 .45rem 1rem rgba(128, 64, 0, .16),
        inset 0 .1rem .25rem rgba(255, 255, 255, .18);
    }

    .offline-indicator__icon i {
      color: #fff;
      font-size: 1.75rem;
    }

    /* =========================================================
       DIVIDER
    ========================================================= */

    .offline-indicator__divider {
      position: relative;
      z-index: 2;
      width: 1px;
      height: 2.7rem;
      background: rgba(255, 255, 255, .28);
    }

    /* =========================================================
       CONTENT
    ========================================================= */

    .offline-indicator__content {
      position: relative;
      z-index: 2;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: .18rem;
    }

    .offline-indicator__content strong {
      display: block;
      color: #fff;
      font-size: .82rem;
      font-weight: 750;
      line-height: 1.3;
    }

    .offline-indicator__content span {
      display: block;
      max-width: 31rem;
      color: rgba(255, 255, 255, .92);
      font-size: .62rem;
      font-weight: 450;
      line-height: 1.45;
    }

    /* =========================================================
       STATUS
    ========================================================= */

    .offline-indicator__status {
      position: relative;
      z-index: 2;
      min-height: 2.6rem;
      padding: .5rem .8rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .45rem;
      border: 1px solid rgba(255, 255, 255, .16);
      border-radius: .65rem;
      color: #fff;
      background: rgba(173, 78, 0, .24);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      font-size: .61rem;
      font-weight: 700;
      white-space: nowrap;
    }

    /* =========================================================
       PULSE
    ========================================================= */

    .offline-indicator__pulse {
      position: relative;
      width: .55rem;
      height: .55rem;
      flex: 0 0 .55rem;
      border: 2px solid #fff;
      border-radius: 50%;
    }

    .offline-indicator__pulse::after {
      content: '';
      position: absolute;
      inset: 50% auto auto 50%;
      width: .55rem;
      height: .55rem;
      border: 1px solid rgba(255, 255, 255, .75);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: offline-pulse 1.4s ease-out infinite;
    }

    /* =========================================================
       ANIMATIONS
    ========================================================= */

    @keyframes offline-slide-down {
      from {
        opacity: 0;
        transform: translate(-50%, -1rem);
      }

      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }

    @keyframes offline-pulse {
      0% {
        opacity: .9;
        transform: translate(-50%, -50%) scale(.7);
      }

      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(2.3);
      }
    }

    /* =========================================================
       TABLET
    ========================================================= */

    @media screen and (max-width: 800px) {
      .offline-indicator {
        width: calc(100% - 1.5rem);
      }

      .offline-indicator__card {
        grid-template-columns: auto auto minmax(0, 1fr);
      }

      .offline-indicator__status {
        display: none;
      }
    }

    /* =========================================================
       MOBILE
    ========================================================= */

    @media screen and (max-width: 650px) {
      .offline-indicator {
        top: .7rem;
        width: calc(100% - 1.2rem);
        max-width: 24rem;
      }

      .offline-indicator__card {
        min-height: 4.8rem;
        padding: .7rem .75rem;
        grid-template-columns: auto auto minmax(0, 1fr);
        gap: .65rem;
        border-radius: .9rem;
      }

      .offline-indicator__icon {
        width: 3rem;
        height: 3rem;
      }

      .offline-indicator__icon i {
        font-size: 1.5rem;
      }

      .offline-indicator__divider {
        height: 2.35rem;
      }

      .offline-indicator__content strong {
        font-size: .72rem;
      }

      .offline-indicator__content span {
        max-width: 15rem;
        font-size: .55rem;
      }

      .offline-indicator__card::before {
        right: -3rem;
      }

      .offline-indicator__card::after {
        right: .4rem;
        bottom: .25rem;
      }
    }

    /* =========================================================
       SMALL MOBILE
    ========================================================= */

    @media screen and (max-width: 390px) {
      .offline-indicator {
        width: calc(100% - .9rem);
      }

      .offline-indicator__card {
        min-height: 4.5rem;
        padding: .6rem;
        gap: .55rem;
      }

      .offline-indicator__icon {
        width: 2.7rem;
        height: 2.7rem;
      }

      .offline-indicator__icon i {
        font-size: 1.35rem;
      }

      .offline-indicator__content strong {
        font-size: .67rem;
      }

      .offline-indicator__content span {
        font-size: .51rem;
        line-height: 1.4;
      }
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {

  isOnline = true;

  private onlineSubscription?: Subscription;


  constructor(
    private pwaService: PwaService
  ) {}


  ngOnInit(): void {
    this.isOnline = this.pwaService.isOnline();

    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }


  ngOnDestroy(): void {
    if (this.onlineSubscription) {
      this.onlineSubscription.unsubscribe();
    }
  }

}