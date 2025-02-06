import {Injectable, NgZone, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, fromEvent, merge, Subscription, timer } from 'rxjs';
import { debounceTime, switchMap, takeUntil, catchError, tap } from 'rxjs/operators';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class IdleService implements OnDestroy {
  private readonly INACTIVITY_TIMEOUT = 50 * 60 * 1000; // 30 minutes
  private readonly ACTIVITY_DEBOUNCE_TIME = 1000; // 500ms
  private activityDetected$: Subject<void> = new Subject();
  private subscriptions = new Subscription();

  constructor(private router: Router, private usersService: UsersService, private ngZone: NgZone) {
    this.startMonitoring();
    this.ngZone.run(() => this.startMonitoring());
  }

  // Start monitoring user activity
  private startMonitoring() {
    console.log('Starting activity monitoring...');
    const activityEvents$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'click'),
      fromEvent(document, 'scroll')
    );

    this.subscriptions.add(
      activityEvents$
        .pipe(
          debounceTime(this.ACTIVITY_DEBOUNCE_TIME), // Throttle frequent events
          tap(() => console.log('Activity detected: resetting timer.')), // Log activity events
          switchMap(() => {
            this.resetInactivityTimer();
            return this.activityDetected$.asObservable();
          }),
          catchError((error) => {
            console.error('Error in activity monitoring:', error);
            return [];
          })
        )
        .subscribe()
    );

    this.resetInactivityTimer();
  }

  // Reset the inactivity timeout
  private resetInactivityTimer() {
    console.log('Resetting inactivity timer...');
    this.clearTimers();

    this.subscriptions.add(
      timer(this.INACTIVITY_TIMEOUT)
        .pipe(
          takeUntil(this.activityDetected$),
          tap(() => console.log('No activity detected: starting logout process.')) // Log timeout trigger
        )
        .subscribe(() => this.logout())
    );
  }

  // Clear timers and unsubscribe
  private clearTimers() {
    console.log('Clearing all timers...');
    this.activityDetected$.next();
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription(); // Reset the subscription container
  }

  // Logout the user on inactivity
  private logout() {
    console.log('Logging out due to inactivity...');
    this.clearTimers();
    this.usersService.logout();
    this.router.navigate(['/login']);
  }

  // Clean up resources when the service is destroyed
  ngOnDestroy() {
    console.log('Destroying IdleService: cleaning up resources.');
    this.clearTimers();
  }
}
