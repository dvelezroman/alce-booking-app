import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';

import { selectUserData } from '../../../store/user.selector';
import { UserDto } from '../../../services/dtos/user.dto';

import { EmailService } from '../../../services/email.service';
import { EmailMessage, GetEmailMessagesResponse } from '../../../services/dtos/email.dto';

@Component({
  selector: 'app-dashboard-emails-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-emails-widget.component.html',
  styleUrl: './dashboard-emails-widget.component.scss',
})
export class DashboardEmailsWidgetComponent implements OnInit {

  emails: EmailMessage[] = [];
  totalEmails = 0;

  loading = false;

  constructor(
    private emailService: EmailService,
    private store: Store
  ) {}

  ngOnInit(): void {

    this.store.select(selectUserData)
      .pipe(take(1))
      .subscribe((u: UserDto | null) => {

        if (!u?.id) return;

        this.fetchEmails();

      });

  }

  fetchEmails() {

    this.loading = true;

    this.emailService.getEmailMessages({
      page: 1
    })
    .subscribe({

      next: (res: GetEmailMessagesResponse) => {

        this.totalEmails = res.totalMessages || 0;

        this.emails = (res.messages || [])
          .sort((a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          )
          .slice(0, 10);

        this.loading = false;

      },

      error: () => {
        this.emails = [];
        this.totalEmails = 0;
        this.loading = false;
      }

    });

  }

}