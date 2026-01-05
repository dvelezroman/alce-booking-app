import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type BannerType = 'info' | 'warning';

export interface BannerState {
  type: BannerType;
  visible: boolean;   // 👈 icono visible en header
  expanded: boolean;  // 👈 banner abierto en pantalla
  count?: number;
}

@Injectable({ providedIn: 'root' })
export class BannerStateService {

  private infoBanner$ = new BehaviorSubject<BannerState>({
    type: 'info',
    visible: false,
    expanded: true,
    count: 0,
  });

  private warningBanner$ = new BehaviorSubject<BannerState>({
    type: 'warning',
    visible: false,
    expanded: true,
    count: 0,
  });

  // 🔓 Expuestos
  info$ = this.infoBanner$.asObservable();
  warning$ = this.warningBanner$.asObservable();

  /* =====================================================
     CERRAR BANNER (se oculta y muestra icono en header)
     ===================================================== */
  close(type: BannerType, count = 1): void {
    this.getSubject(type).next({
      type,
      visible: true,
      expanded: false,
      count,
    });
  }

  /* =====================================================
     ABRIR BANNER (desde el header)
     ===================================================== */
  open(type: BannerType): void {
    this.getSubject(type).next({
      type,
      visible: false,
      expanded: true,
      count: 0,
    });
  }

  /* =====================================================
     UTIL
     ===================================================== */
  private getSubject(type: BannerType) {
    return type === 'info'
      ? this.infoBanner$
      : this.warningBanner$;
  }

  /* =====================================================
   LIMPIAR ESTADO (USAR EN LOGOUT)
   ===================================================== */
    reset(): void {
    this.infoBanner$.next({
        type: 'info',
        visible: false,
        expanded: true,
        count: 0,
    });

    this.warningBanner$.next({
        type: 'warning',
        visible: false,
        expanded: true,
        count: 0,
    });
    }
}