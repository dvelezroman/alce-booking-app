import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDto } from '../../../services/dtos/user.dto';
import { UserSelectorComponent } from '../../../components/notifications/user-selector/user-selector.component';
import { StageSelectorComponent } from '../../../components/notifications/stage-selector/stage-selector.component';
import { StagesService } from '../../../services/stages.service';
import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-broadcast-groups',
  standalone: true,
  imports: [CommonModule, UserSelectorComponent, StageSelectorComponent],
  templateUrl: './broadcast-groups.component.html',
  styleUrl: './broadcast-groups.component.scss'
})
export class BroadcastGroupsComponent implements OnInit {
  selectedUser: UserDto | null = null;
  stages: Stage[] = [];
  selectedStage: Stage | null = null;

  constructor(private stagesService: StagesService) {}

  ngOnInit() {
    this.stagesService.getAll().subscribe((response: Stage[]) => {
      this.stages = response;
    });
  }

  handleUserSelect(user: UserDto) {
    this.selectedUser = user;
    console.log('Usuario seleccionado:', user);
  }

  handleStageSelect(stage: Stage | null): void {
    if (stage) {
      console.log('Stage seleccionado:', stage);
    } else {
      console.log('Stage limpio');
    }
  }
}