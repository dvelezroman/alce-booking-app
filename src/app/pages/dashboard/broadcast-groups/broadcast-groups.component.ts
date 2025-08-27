import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserDto } from '../../../services/dtos/user.dto';
import { Stage } from '../../../services/dtos/student.dto';

import { UserSelectorComponent } from '../../../components/notifications/user-selector/user-selector.component';
import { StageSelectorComponent } from '../../../components/notifications/stage-selector/stage-selector.component';
import { NotificationPanelComponent } from '../../../components/notifications/notification-panel/notification-panel.component';

import { StagesService } from '../../../services/stages.service';

@Component({
  selector: 'app-broadcast-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserSelectorComponent,
    StageSelectorComponent,
    NotificationPanelComponent,
  ],
  templateUrl: './broadcast-groups.component.html',
  styleUrl: './broadcast-groups.component.scss',
})
export class BroadcastGroupsComponent implements OnInit {
  activePanel: 'create' | 'groups' | 'notifications' = 'create';
  selectedAction: 'user' | 'stage' | 'group' | '' = '';
  selectedUser: UserDto | null = null;
  stages: Stage[] = [];
  selectedStage: Stage | null = null;

  resetChildren = false;

  constructor(private stagesService: StagesService) {}

  ngOnInit() {
    this.stagesService.getAll().subscribe((response: Stage[]) => {
      this.stages = response;
    });
  }

  handleUserSelect(user: UserDto | null) {
    this.selectedUser = user;
    if (user) {
      console.log('Usuario seleccionado:', user);
    }
  }

  handleStageSelect(stage: Stage | null): void {
    this.selectedStage = stage;
    if (stage) {
      console.log('Stage seleccionado:', stage);
    }
  }

  /** Limpia toda la selección (usuario, stage, acción) */
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

  /** Cambiar de panel limpia todo */
  onActionSelected(panel: 'create' | 'groups' | 'notifications') {
    this.activePanel = panel;
    this.clearSelection();
    console.log('Acción seleccionada desde el panel:', panel);
  }

  /** Seleccionar opción de envío */
  onSendOptionSelected(option: 'user' | 'stage' | 'group') {
    this.selectedAction = option;

    // Si la opción no es usuario, limpiamos usuario
    if (option !== 'user') {
      this.selectedUser = null;
    }

    // Si la opción no es stage, limpiamos stage
    if (option !== 'stage') {
      this.selectedStage = null;
    }

    console.log('Opción de envío seleccionada:', option);
  }
}