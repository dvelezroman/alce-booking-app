import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Group } from '../../../services/dtos/whatsapp-group.dto';
import { WhatsAppGroupService } from '../../../services/whatsapp-group.service';

@Component({
  selector: 'app-dashboard-whatsapp-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-whatsapp-widget.component.html',
  styleUrls: ['./dashboard-whatsapp-widget.component.scss']
})
export class DashboardWhatsappWidgetComponent implements OnInit {

  groups: Group[] = [];
  totalGroups = 0;
  loading = false;

  constructor(private whatsappSvc: WhatsAppGroupService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {

    this.loading = true;

    this.whatsappSvc.getGroups().subscribe({

      next: (res) => {

        const normalGroups = res.groups || [];

        this.whatsappSvc.getDiffusionGroups().subscribe({

          next: (res2) => {

            const diffusionGroups = res2.groups || [];

            const allGroups = [...normalGroups, ...diffusionGroups];

            this.totalGroups = allGroups.length;

            this.groups = allGroups.slice(0,5);

            this.loading = false;

          },

          error: () => {
            this.groups = [];
            this.totalGroups = 0;
            this.loading = false;
          }

        });

      },

      error: () => {
        this.groups = [];
        this.totalGroups = 0;
        this.loading = false;
      }

    });

  }

}