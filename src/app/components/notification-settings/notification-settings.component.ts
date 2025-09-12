import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notification-settings">
      <h3 class="title is-4">Configuración de Notificaciones</h3>
      
      <div class="notification-status" *ngIf="isSupported">
        <div class="field">
          <label class="label">Estado de las notificaciones</label>
          <div class="control">
            <span class="tag" [class]="getStatusClass()">
              {{ getStatusText() }}
            </span>
          </div>
        </div>
      </div>

      <div class="notification-actions" *ngIf="isSupported">
        <div class="field">
          <label class="label">Acciones</label>
          <div class="control">
            <button 
              class="button is-primary" 
              (click)="enableNotifications()"
              [disabled]="isLoading || permission === 'granted'">
              <span *ngIf="!isLoading">Activar Notificaciones</span>
              <span *ngIf="isLoading" class="loading-spinner"></span>
            </button>
            
            <button 
              class="button is-danger" 
              (click)="disableNotifications()"
              [disabled]="isLoading || permission !== 'granted'">
              Desactivar Notificaciones
            </button>
          </div>
        </div>
      </div>

      <div class="notification-info" *ngIf="isSupported">
        <div class="notification-item">
          <div class="notification-item-content">
            <i class="material-icons">notifications</i>
            <div>
              <h4>Notificaciones Push</h4>
              <p>Recibe notificaciones sobre nuevas notificaciones, recordatorios de clases y actualizaciones importantes.</p>
            </div>
          </div>
          <div class="notification-item-status">
            <span class="tag" [class]="isSubscribed ? 'is-success' : 'is-light'">
              {{ isSubscribed ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>

        <div class="notification-item">
          <div class="notification-item-content">
            <i class="material-icons">schedule</i>
            <div>
              <h4>Verificación Periódica</h4>
              <p>El sistema verifica nuevas notificaciones cada 5 minutos cuando la aplicación está abierta.</p>
            </div>
          </div>
          <div class="notification-item-status">
            <span class="tag is-info">Automático</span>
          </div>
        </div>
      </div>

      <div class="notification-unsupported" *ngIf="!isSupported">
        <div class="notification is-warning">
          <div class="notification-body">
            <i class="material-icons">warning</i>
            <div>
              <h4>Notificaciones no compatibles</h4>
              <p>Tu navegador no soporta notificaciones push. Por favor, usa un navegador moderno como Chrome, Firefox o Safari.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="notification-tips">
        <h4 class="title is-5">Consejos</h4>
        <ul>
          <li>Las notificaciones solo funcionan cuando la aplicación está instalada como PWA</li>
          <li>Puedes desactivar las notificaciones en cualquier momento desde la configuración de tu navegador</li>
          <li>Las notificaciones se sincronizan automáticamente cuando vuelves a estar en línea</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .notification-settings {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .notification-status {
      margin-bottom: 20px;
    }

    .notification-actions {
      margin-bottom: 30px;
    }

    .notification-actions .control {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .notification-info {
      margin-bottom: 30px;
    }

    .notification-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 12px;
      background: #fafafa;
    }

    .notification-item-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .notification-item-content i {
      font-size: 24px;
      color: #1976d2;
    }

    .notification-item-content h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .notification-item-content p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .notification-item-status {
      flex-shrink: 0;
    }

    .notification-unsupported {
      margin-bottom: 30px;
    }

    .notification-unsupported .notification {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notification-unsupported .notification-body {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notification-unsupported .notification-body i {
      font-size: 24px;
      color: #ff9800;
    }

    .notification-unsupported .notification-body h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .notification-unsupported .notification-body p {
      margin: 0;
      font-size: 14px;
    }

    .notification-tips {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
    }

    .notification-tips h4 {
      margin-bottom: 12px;
    }

    .notification-tips ul {
      margin: 0;
      padding-left: 20px;
    }

    .notification-tips li {
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .notification-settings {
        padding: 16px;
      }
      
      .notification-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .notification-item-status {
        align-self: flex-end;
      }
      
      .notification-actions .control {
        flex-direction: column;
      }
    }
  `]
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  isSupported = false;
  permission: NotificationPermission = 'default';
  isSubscribed = false;
  isLoading = false;
  private subscriptions: Subscription[] = [];

  constructor(private pushNotificationService: PushNotificationService) {}

  ngOnInit() {
    this.isSupported = this.pushNotificationService.isSupported();
    
    if (this.isSupported) {
      this.subscriptions.push(
        this.pushNotificationService.permission$.subscribe(permission => {
          this.permission = permission;
        })
      );

      this.subscriptions.push(
        this.pushNotificationService.isSubscribed().subscribe(isSubscribed => {
          this.isSubscribed = isSubscribed;
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async enableNotifications() {
    this.isLoading = true;
    
    try {
      const subscription = await this.pushNotificationService.subscribeToPush();
      
      if (subscription) {
        // Start periodic notification checks
        this.pushNotificationService.startPeriodicNotificationCheck(5);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async disableNotifications() {
    this.isLoading = true;
    
    try {
      await this.pushNotificationService.unsubscribeFromPush();
    } catch (error) {
      console.error('Error disabling notifications:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getStatusClass(): string {
    switch (this.permission) {
      case 'granted':
        return 'is-success';
      case 'denied':
        return 'is-danger';
      default:
        return 'is-warning';
    }
  }

  getStatusText(): string {
    switch (this.permission) {
      case 'granted':
        return 'Permitido';
      case 'denied':
        return 'Denegado';
      default:
        return 'No configurado';
    }
  }
}
