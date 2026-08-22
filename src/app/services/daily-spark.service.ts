import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DAILY_SPARKS } from '../data/daily-sparks';
import { DailySpark } from './dtos/daily-spark.dto';
import { StudentClassification } from './dtos/student.dto';

const SEEN_PREFIX = 'alce.spark.seen.';
const HISTORY_PREFIX = 'alce.spark.history.';
const HISTORY_LIMIT = 14;

@Injectable({
  providedIn: 'root',
})
export class DailySparkService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = () => isPlatformBrowser(this.platformId);

  /**
   * Stable daily pick for this user: same day + same user => same spark.
   * Avoids recent history (last 14 ids) when possible.
   */
  getTodaySpark(
    userId: number,
    classification?: StudentClassification | string | null
  ): DailySpark | null {
    const pool = this.filterByAudience(classification);
    if (pool.length === 0) {
      return null;
    }

    const dayKey = this.todayKey();
    const history = this.getHistory(userId);
    const startIndex = this.hashToIndex(`${userId}:${dayKey}`, pool.length);

    for (let offset = 0; offset < pool.length; offset++) {
      const candidate = pool[(startIndex + offset) % pool.length];
      if (!history.includes(candidate.id)) {
        return candidate;
      }
    }

    // Entire pool was in history — fall back to hashed pick
    return pool[startIndex];
  }

  shouldShowOverlay(userId: number): boolean {
    if (!this.isBrowser() || !userId) {
      return false;
    }

    try {
      return localStorage.getItem(this.seenKey(userId, this.todayKey())) !== '1';
    } catch {
      return false;
    }
  }

  markSeen(userId: number, sparkId?: string): void {
    if (!this.isBrowser() || !userId) {
      return;
    }

    try {
      localStorage.setItem(this.seenKey(userId, this.todayKey()), '1');

      if (sparkId) {
        this.pushHistory(userId, sparkId);
      }
    } catch {
      // Quota / private mode — ignore
    }
  }

  /** Clear spark keys for all users on this browser (call on logout). */
  clearAllSparkStorage(): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith(SEEN_PREFIX) || key.startsWith(HISTORY_PREFIX))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore
    }
  }

  private filterByAudience(
    classification?: StudentClassification | string | null
  ): DailySpark[] {
    const isKids = classification === StudentClassification.KIDS || classification === 'KIDS';

    return DAILY_SPARKS.filter((spark) => {
      if (isKids) {
        return spark.audience !== 'adult';
      }
      return spark.audience !== 'kids';
    });
  }

  private todayKey(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private seenKey(userId: number, dayKey: string): string {
    return `${SEEN_PREFIX}${userId}.${dayKey}`;
  }

  private historyKey(userId: number): string {
    return `${HISTORY_PREFIX}${userId}`;
  }

  private getHistory(userId: number): string[] {
    if (!this.isBrowser()) {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.historyKey(userId));
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : [];
    } catch {
      return [];
    }
  }

  private pushHistory(userId: number, sparkId: string): void {
    const history = this.getHistory(userId).filter((id) => id !== sparkId);
    history.push(sparkId);
    const trimmed = history.slice(-HISTORY_LIMIT);

    try {
      localStorage.setItem(this.historyKey(userId), JSON.stringify(trimmed));
    } catch {
      // ignore
    }
  }

  /** Deterministic non-crypto hash → index in [0, length). */
  private hashToIndex(input: string, length: number): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return length > 0 ? hash % length : 0;
  }
}
