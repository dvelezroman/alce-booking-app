import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { selectIsLoggedIn } from "../../store/user.selector";
import { filter, Observable } from "rxjs";

import {
  BannerStateService,
  BannerState,
  BannerType
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

  // 🔔 estados de banners
  infoBanner!: BannerState;
  warningBanner!: BannerState;

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

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPage = event.urlAfterRedirects.split('/').pop() || '';
      });

    // 👇 Escuchamos cambios globales de banners
    this.bannerState.info$.subscribe(state => {
      this.infoBanner = state;
    });

    this.bannerState.warning$.subscribe(state => {
      this.warningBanner = state;
    });
  }

  /* =====================================================
     CLICK DESDE HEADER
     ===================================================== */

  openInfoBanner(): void {
    this.bannerState.open('info');
  }

  openWarningBanner(): void {
    this.bannerState.open('warning');
  }
}