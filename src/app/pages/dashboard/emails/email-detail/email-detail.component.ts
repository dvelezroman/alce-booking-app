import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EmailMessage } from '../../../../services/dtos/email.dto';

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-detail.component.html',
  styleUrls: ['./email-detail.component.scss'],
})
export class EmailDetailComponent implements OnInit, OnDestroy {
  email?: EmailMessage;
  origin: string = 'unknown';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const st = history.state as { email?: EmailMessage; origin?: string };
    if (st?.email) {
      this.email = st.email;
      this.origin = st.origin ?? 'unknown';
      console.log('[EmailDetail] recibido:', this.email);
    } else {
      // Si no vino nada, vuelve al historial
      this.router.navigate(['/dashboard/historial-email']);
    }
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}