import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationCountService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.listenToServiceWorkerMessages();
    this.loadInitialCount();
  }

  /**
   * Listen to messages from service worker
   */
  private listenToServiceWorkerMessages(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UNREAD_COUNT_UPDATE') {
          this.updateUnreadCount(event.data.count);
        }
      });
    }
  }

  /**
   * Load initial unread count from service worker
   */
  private async loadInitialCount(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications();
        this.updateUnreadCount(notifications.length);
      } catch (error) {
        console.error('Error loading initial notification count:', error);
      }
    }
  }

  /**
   * Update unread count
   */
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(Math.max(0, count));
  }

  /**
   * Get current unread count
   */
  getCurrentCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Increment unread count
   */
  incrementCount(): void {
    const currentCount = this.getCurrentCount();
    this.updateUnreadCount(currentCount + 1);
  }

  /**
   * Decrement unread count
   */
  decrementCount(): void {
    const currentCount = this.getCurrentCount();
    this.updateUnreadCount(currentCount - 1);
  }

  /**
   * Reset unread count to zero
   */
  resetCount(): void {
    this.updateUnreadCount(0);
  }

  /**
   * Send message to service worker to update count
   */
  async sendCountToServiceWorker(count: number): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({
            type: 'UPDATE_UNREAD_COUNT',
            count: count
          });
        }
      } catch (error) {
        console.error('Error sending count to service worker:', error);
      }
    }
  }
}
