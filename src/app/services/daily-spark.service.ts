import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DAILY_SPARKS } from '../data/daily-sparks';
import { DailySpark, SparkKind } from './dtos/daily-spark.dto';
import { StudentClassification } from './dtos/student.dto';

const SEEN_PREFIX = 'alce.spark.seen.';
const HISTORY_PREFIX = 'alce.spark.history.';
const PICK_PREFIX = 'alce.spark.pick.';
const HISTORY_LIMIT = 14;

@Injectable({
  providedIn: 'root',
})
export class DailySparkService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = () => isPlatformBrowser(this.platformId);

  /** Stable daily quote: same user + day => same quote. */
  getTodayQuote(
    userId: number,
    classification?: StudentClassification | string | null
  ): DailySpark | null {
    return this.pickForKind(userId, classification, 'quote');
  }

  /** Stable daily trivia: same user + day => same trivia. */
  getTodayTrivia(
    userId: number,
    classification?: StudentClassification | string | null
  ): DailySpark | null {
    return this.pickForKind(userId, classification, 'trivia');
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
        this.pushHistory(userId, sparkId, 'trivia');
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
          (key.startsWith(SEEN_PREFIX) ||
            key.startsWith(HISTORY_PREFIX) ||
            key.startsWith(PICK_PREFIX))
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

  private pickForKind(
    userId: number,
    classification: StudentClassification | string | null | undefined,
    kind: SparkKind
  ): DailySpark | null {
    const pool = this.filterByAudience(classification).filter(
      (spark) => spark.kind === kind
    );
    if (pool.length === 0) {
      return null;
    }

    const dayKey = this.todayKey();
    const cached = this.getCachedPick(userId, kind, dayKey);
    if (cached) {
      const fromCache = pool.find((spark) => spark.id === cached);
      if (fromCache) {
        return fromCache;
      }
    }

    const history = this.getHistory(userId, kind);
    const startIndex = this.hashToIndex(
      `${userId}:${dayKey}:${kind}`,
      pool.length
    );

    let chosen = pool[startIndex];
    for (let offset = 0; offset < pool.length; offset++) {
      const candidate = pool[(startIndex + offset) % pool.length];
      if (!history.includes(candidate.id)) {
        chosen = candidate;
        break;
      }
    }

    this.cachePick(userId, kind, dayKey, chosen.id);
    this.pushHistory(userId, chosen.id, kind);

    return chosen;
  }

  private getCachedPick(
    userId: number,
    kind: SparkKind,
    dayKey: string
  ): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      return localStorage.getItem(this.pickKey(userId, kind, dayKey));
    } catch {
      return null;
    }
  }

  private cachePick(
    userId: number,
    kind: SparkKind,
    dayKey: string,
    sparkId: string
  ): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      localStorage.setItem(this.pickKey(userId, kind, dayKey), sparkId);
    } catch {
      // ignore
    }
  }

  private pickKey(userId: number, kind: SparkKind, dayKey: string): string {
    return `${PICK_PREFIX}${userId}.${kind}.${dayKey}`;
  }

  private historyKey(userId: number, kind: SparkKind): string {
    return `${HISTORY_PREFIX}${userId}.${kind}`;
  }

  private getHistory(userId: number, kind: SparkKind): string[] {
    if (!this.isBrowser()) {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.historyKey(userId, kind));
      if (!raw) {
        return this.migrateLegacyHistory(userId, kind);
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : [];
    } catch {
      return [];
    }
  }

  /** One-time read of pre-split history bucket. */
  private migrateLegacyHistory(userId: number, kind: SparkKind): string[] {
    try {
      const legacyRaw = localStorage.getItem(`${HISTORY_PREFIX}${userId}`);
      if (!legacyRaw) {
        return [];
      }
      const parsed = JSON.parse(legacyRaw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const ids = parsed.filter((id): id is string => typeof id === 'string');
      const prefix = kind === 'quote' ? 'q-' : 't-';
      return ids.filter((id) => id.startsWith(prefix));
    } catch {
      return [];
    }
  }

  private pushHistory(
    userId: number,
    sparkId: string,
    kind: SparkKind
  ): void {
    const history = this.getHistory(userId, kind).filter((id) => id !== sparkId);
    history.push(sparkId);
    const trimmed = history.slice(-HISTORY_LIMIT);

    try {
      localStorage.setItem(
        this.historyKey(userId, kind),
        JSON.stringify(trimmed)
      );
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
