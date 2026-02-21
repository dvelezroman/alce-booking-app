import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { selectIsLoggedIn } from "../../store/user.selector";
import { filter, Observable } from "rxjs";

import {
  BannerStateService,
  BannerState
} from '../../services/banner-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  currentPage: string = '';
  isLoggedIn$: Observable<boolean>;
  isLoggedIn = false;

  infoBanner!: BannerState;
  warningBanner!: BannerState;

  isDashboardHome = false;

  constructor(
    private router: Router,
    private store: Store,
    private bannerState: BannerStateService
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
  }

  ngOnInit(): void {

    this.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
    });

    // 🔥 DETECTAR HOME AL CARGAR
    this.checkIfHome(this.router.url);

    // 🔥 DETECTAR HOME AL NAVEGAR
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkIfHome(event.urlAfterRedirects);
      });

    // 🔔 Escuchar estado global de banners
    this.bannerState.info$.subscribe(state => {
      this.infoBanner = state;
    });

    this.bannerState.warning$.subscribe(state => {
      this.warningBanner = state;
    });
  }

  private checkIfHome(url: string) {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];
    this.isDashboardHome = cleanUrl === '/dashboard/home';
  }

  openInfoBanner(): void {
    this.bannerState.open('info');
  }

  openWarningBanner(): void {
    this.bannerState.open('warning');
  }
}