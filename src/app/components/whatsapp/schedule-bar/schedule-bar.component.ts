import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type SendMode = 'now' | 'schedule';

@Component({
  selector: 'app-schedule-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-bar.component.html',
  styleUrls: ['./schedule-bar.component.scss'],
})
export class ScheduleBarComponent implements OnInit {
  sendMode: SendMode = 'now';

  // Controles de programación
  dateStr = '';
  timeStr = '';

  etaText = '—';

  ngOnInit(): void {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const in10 = new Date(now.getTime() + 10 * 60 * 1000);

    this.dateStr = `${in10.getFullYear()}-${pad(in10.getMonth() + 1)}-${pad(in10.getDate())}`;
    this.timeStr = `${pad(in10.getHours())}:${pad(in10.getMinutes())}`;

    this.updateEta();
  }

  onModeChange(mode: SendMode) {
    this.sendMode = mode;
    this.updateEta();
  }

  onDateTimeChange() {
    this.updateEta();
  }

  private updateEta(): void {
    if (this.sendMode === 'now') {
      this.etaText = 'inmediatamente';
      return;
    }

    if (!this.dateStr || !this.timeStr) {
      this.etaText = '—';
      return;
    }

    // Tomamos fecha/hora como zona local del navegador (simple y suficiente por ahora)
    const target = new Date(`${this.dateStr}T${this.timeStr}:00`);
    const now = new Date();

    const diffMs = target.getTime() - now.getTime();
    if (isNaN(diffMs)) { this.etaText = '—'; return; }

    if (diffMs <= 0) {
      this.etaText = 'ahora (la fecha/hora ya pasó)';
      return;
    }

    this.etaText = this.humanizeDiff(diffMs);
  }

  private humanizeDiff(ms: number): string {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hrs = Math.floor(min / 60);
    const days = Math.floor(hrs / 24);

    const remH = hrs % 24;
    const remM = min % 60;

    if (days > 0) {
      if (remH === 0 && remM === 0) return `en ${days} ${days === 1 ? 'día' : 'días'}`;
      if (remM === 0) return `en ${days} ${days === 1 ? 'día' : 'días'} y ${remH} h`;
      return `en ${days} ${days === 1 ? 'día' : 'días'}, ${remH} h ${remM} min`;
    }
    if (hrs > 0) {
      if (remM === 0) return `en ${hrs} h`;
      return `en ${hrs} h ${remM} min`;
    }
    if (min > 0) return `en ${min} min`;
    return `en menos de 1 min`;
  }
}