import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { AssessmentResourceI } from '../../services/dtos/assessment-resources.dto';
import { SafeNoteHtmlPipe } from '../../pipes/safe-note-html.pipe';
import { BannerStateService, BannerType } from '../../services/banner-state.service';

@Component({
  selector: 'app-student-banner',
  standalone: true,
  imports: [CommonModule, SafeNoteHtmlPipe],
  templateUrl: './student-banner.component.html',
  styleUrls: ['./student-banner.component.scss'],
})
export class StudentBannerComponent implements OnInit, OnDestroy {

  @Input() type: BannerType = 'info';
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() icon: string = 'info';
  @Input() resources: AssessmentResourceI[] = [];

  isExpanded = true;
  isHidden = false;

  private subs = new Subscription();

  constructor(
    private bannerState: BannerStateService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Aplicar regla inicial
    this.handleRouteChange(this.router.url);

    // Escuchar cambios de ruta
    this.subs.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((e) => {
          this.handleRouteChange(e.urlAfterRedirects);
        })
    );

    // Escuchar estado global
    const stream =
      this.type === 'info'
        ? this.bannerState.info$
        : this.bannerState.warning$;

    this.subs.add(
      stream.subscribe(state => {

        if (this.isHidden) {
          this.isExpanded = false;
          return;
        }

        this.isExpanded = state.expanded;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private handleRouteChange(url: string): void {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];

    const isHome = cleanUrl === '/dashboard/home';

    if (isHome) {
      // 🔥 Ocultar completamente en home
      this.isHidden = true;
      this.isExpanded = false;

      // 🔥 Resetear estado global
      this.bannerState.close(this.type, 0);

      return;
    }

    // Fuera de home
    this.isHidden = false;

    // Abrir normalmente
    this.bannerState.open(this.type);
  }

  toggle(): void {
    if (this.isHidden) return;

    if (this.isExpanded) {
      this.bannerState.close(this.type, 1);
    } else {
      this.bannerState.open(this.type);
    }
  }

  closeBanner(): void {
    if (this.isHidden) return;

    if (this.isExpanded) {
      this.bannerState.close(this.type, 1);
    }
  }
}