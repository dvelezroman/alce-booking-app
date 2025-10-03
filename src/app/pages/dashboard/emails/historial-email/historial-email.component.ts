import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { selectUserData } from '../../../../store/user.selector';
import { UserDto } from '../../../../services/dtos/user.dto';
import {
  EmailMessage,
  GetEmailMessagesResponse,
} from '../../../../services/dtos/email.dto';
import { EmailFiltersComponent } from '../../../../components/emails/email-filters/email-filters.component';
import { EmailService } from '../../../../services/email.service';

@Component({
  selector: 'app-historial-email',
  standalone: true,
  imports: [CommonModule, EmailFiltersComponent],
  templateUrl: './historial-email.component.html',
  styleUrl: './historial-email.component.scss',
})
export class HistorialEmailComponent implements OnInit {
  private currentUserId: number | null = null;

  emails: EmailMessage[] = [];
  page = 1;
  limit = 0;
  total = 0;

  loading = false;
  errorMsg = '';

  filters: any = {
    page: this.page,
    limit: this.limit,
    recipientType: '',
    recipientEmail: '',
    status: '',
  };

  constructor(
    private emailService: EmailService,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectUserData)
      .pipe(take(1))
      .subscribe((u: UserDto | null) => {
        this.currentUserId = u?.id ?? null;
        this.fetchEmails();
      });
  }

  onFiltersChange(newFilters: any) {
    this.filters = { ...this.filters, ...newFilters, page: 1 };
    this.page = 1;
    this.fetchEmails();
  }

  fetchEmails() {
    this.loading = true;
    this.errorMsg = '';

    this.emailService
      .getEmailMessages({
        page: this.page,
        limit: this.filters.limit || this.limit,
        recipientType: this.filters.recipientType,
        recipientEmail: this.filters.recipientEmail,
        status: this.filters.status,
        createdAtFrom: this.filters.createdAtFrom || '',
        createdAtTo: this.filters.createdAtTo || '',
      })
      .subscribe({
        next: (res: GetEmailMessagesResponse) => {
          this.emails = (res.messages || []).sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.total = res.totalMessages || this.emails.length || 0;
          this.page = res.page;
          this.limit = res.limit;
          this.loading = false;
        },
        error: (err) => {
          console.error('[HistorialEmail] error:', err);
          this.errorMsg = 'No se pudieron cargar los correos enviados.';
          this.loading = false;
        },
      });
  }

  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    const end = this.page * this.limit;
    return end > this.total ? this.total : end;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'SENT':
        return 'Enviado';
      case 'FAILED':
        return 'Fallido';
      case 'QUEUED':
        return 'En cola';
      default:
        return status;
    }
  }

  onPrev(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchEmails();
    }
  }

  onNext(): void {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.fetchEmails();
    }
  }

  trackById(index: number, e: EmailMessage): number {
    return e.id;
  }

  onRowClick(e: EmailMessage) {
    if (!e?.id) return;

    this.router.navigate(['/dashboard/email-detail'], {
      state: { email: e, origin: 'historial-email' },
    });
  }
}
