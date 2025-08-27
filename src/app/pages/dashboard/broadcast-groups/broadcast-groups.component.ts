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
  activePanel: 'create' | 'groups' = 'create';
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

  onActionSelected(panel: 'create' | 'groups') {
    this.activePanel = panel;
    this.clearSelection();
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
}