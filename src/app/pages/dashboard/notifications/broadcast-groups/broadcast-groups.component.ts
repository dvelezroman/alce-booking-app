import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDto } from '../../../../services/dtos/user.dto';
import { Stage } from '../../../../services/dtos/student.dto';
import { NotificationPanelComponent } from '../../../../components/notifications/notification-panel/notification-panel.component';
import { StagesService } from '../../../../services/stages.service';
import { NotificationFormWrapperComponent } from '../../../../components/notifications/notification-form-wrapper/notification-form-wrapper.component';
import { CreateNotificationDto } from '../../../../services/dtos/notification.dto';
import { NotificationService } from '../../../../services/notification.service';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import { ModalComponent } from '../../../../components/modal/modal.component';

@Component({
  selector: 'app-broadcast-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NotificationPanelComponent,
    NotificationFormWrapperComponent,
    ModalComponent,
  ],
  templateUrl: './broadcast-groups.component.html',
  styleUrl: './broadcast-groups.component.scss',
})
export class BroadcastGroupsComponent implements OnInit {
  selectedAction: 'user' | 'stage' | 'group' | '' = '';
  selectedUser: UserDto | null = null;
  stages: Stage[] = [];
  selectedStage: Stage | null = null;
  modal: ModalDto = modalInitializer();

  resetChildren = false;

  constructor(
    private stagesService: StagesService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.stagesService.getAll().subscribe((response: Stage[]) => {
      this.stages = response
        .filter((s) => {
          const match = s.description.match(/stage\s+(\d+)/i);
          if (!match) return false;
          const num = +match[1];
          return num >= 1 && num <= 19;
        })
        .sort((a, b) => {
          const aNum = +(a.description.match(/stage\s+(\d+)/i)?.[1] || 0);
          const bNum = +(b.description.match(/stage\s+(\d+)/i)?.[1] || 0);
          return aNum - bNum;
        });
    });
  }

  handleUserSelect(user: UserDto | null) {
    this.selectedUser = user;
  }

  handleStageSelect(stage: Stage | null): void {
    this.selectedStage = stage;
  }

  private clearSelection(): void {
    this.selectedAction = '';
    this.selectedUser = null;
    this.selectedStage = null;
    this.resetChildren = true;

    setTimeout(() => {
      this.resetChildren = false;
    }, 0);

    console.log('Selecciones limpiadas');
  }

  onSendOptionSelected(option: 'user' | 'stage' | 'group') {
    this.selectedAction = option;

    if (option !== 'user') {
      this.selectedUser = null;
    }

    if (option !== 'stage') {
      this.selectedStage = null;
    }
  }

  handleNotificationSubmit(payload: CreateNotificationDto): void {
    this.notificationService.create(payload).subscribe({
      next: (response) => {
        this.showSuccessModal();
        this.clearSelection();
      },
      error: (err) => {
        console.error('Error al crear notificación:', err);
        this.showErrorModal();
      },
    });
  }

  private showSuccessModal(): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Notificación enviada',
      message: 'La notificación ha sido enviada con éxito.',
      isSuccess: true,
      close: () => (this.modal.show = false),
    };

    setTimeout(() => {
      this.modal.show = false;
    }, 3000);
  }

  private showErrorModal(): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Error al enviar',
      message:
        'Ocurrió un error al enviar la notificación. Por favor, intenta nuevamente.',
      isError: true,
      close: () => (this.modal.show = false),
    };
    setTimeout(() => {
      this.modal.show = false;
    }, 3000);
  }
}
