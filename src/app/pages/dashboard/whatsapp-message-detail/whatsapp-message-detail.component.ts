import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WhatsAppMessage } from '../../../services/dtos/whatssapp-messages.dto';

@Component({
  selector: 'app-whatsapp-message-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-message-detail.component.html',
  styleUrls: ['./whatsapp-message-detail.component.scss'],
})
export class WhatsAppMessageDetailComponent implements OnInit {
  message: WhatsAppMessage | null = null;
  origin: string | null = null;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      this.message = nav.extras.state['message'] || null;
      this.origin = nav.extras.state['origin'] || null;
    }
  }

  ngOnInit(): void {
    if (!this.message) {
      this.router.navigate(['/dashboard/whatsapp-sent-messages']);
    }
  }

  goBack() {
    if (this.origin === 'whatsapp-sent-messages') {
      this.router.navigate(['/dashboard/whatsapp-sent-messages']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}