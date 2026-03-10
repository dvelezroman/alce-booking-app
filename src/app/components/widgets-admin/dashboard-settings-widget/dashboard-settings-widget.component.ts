import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FeatureFlagService } from '../../../services/feature-flag.service';
import { HandleDatesService } from '../../../services/handle-dates.service';
import { FeatureFlagDto } from '../../../services/dtos/feature-flag.dto';
import { DisabledDatesAndHours } from '../../../services/dtos/handle-date.dto';

@Component({
  selector: 'app-dashboard-settings-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-settings-widget.component.html',
  styleUrl: './dashboard-settings-widget.component.scss'
})
export class DashboardSettingsWidgetComponent implements OnInit {

  ffs: FeatureFlagDto[] = [];

  disabledDatesAndHours: DisabledDatesAndHours = {};

  totalDisabledDays = 0;
  totalDisabledHours = 0;

  loading = false;

  currentMonthLabel =
    new Date()
      .toLocaleString('es-ES', { month: 'long' })
      .replace(/^./, m => m.toUpperCase());

  constructor(
    private ffService: FeatureFlagService,
    private handleDatesService: HandleDatesService
  ) {}

  ngOnInit(): void {
    this.loadFlags();
    this.loadScheduleStatus();
  }

  loadFlags() {

    this.ffService.getAll().subscribe({
      next: (res) => {
        this.ffs = res || [];
      }
    });

  }

  loadScheduleStatus() {

    const now = new Date();
    const year = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11

    this.handleDatesService
      .getNotAvailableDatesAndHours(`${year}-01-01`, `${year}-12-31`, null, null, null)
      .subscribe({

        next: (res) => {

          this.disabledDatesAndHours = res;

          let days = 0;
          let hours = 0;

          const monthData = res[currentMonth.toString()] || [];

          monthData.forEach((d: any) => {

            if (d.hours.length === 0) {
              days++;
            } else {
              hours += d.hours.length;
            }

          });

          this.totalDisabledDays = days;
          this.totalDisabledHours = hours;

        }

      });

  }

  getFlagStatus(name: string): boolean {

    const flag = this.ffs.find(f => f.name === name);

    return flag?.status ?? false;

  }

}