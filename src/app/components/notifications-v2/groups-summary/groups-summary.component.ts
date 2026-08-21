import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  NotificationGroupDto,
} from '../../../services/dtos/notification.dto';

@Component({
  selector: 'app-groups-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './groups-summary.component.html',
  styleUrl: './groups-summary.component.scss',
})
export class GroupsSummaryComponent {

  @Input()
  groups: NotificationGroupDto[] = [];

  @Input()
  loading = false;


  /* =========================
     TOTAL GROUPS
  ========================= */

  get totalGroups(): number {
    return this.groups.length;
  }


  /* =========================
     TOTAL USERS
  ========================= */

  get totalUsers(): number {
    const userIds =
      this.groups.flatMap(
        group =>
          group.userIds ??
          group.users?.map(
            user => user.id,
          ) ??
          [],
      );

    return new Set(
      userIds,
    ).size;
  }


  /* =========================
     GROUPS WITH USERS
  ========================= */

  get groupsWithUsers(): number {
    return this.groups.filter(
      group =>
        (
          group.userIds?.length ??
          group.users?.length ??
          0
        ) > 0,
    ).length;
  }


  /* =========================
     EMPTY GROUPS
  ========================= */

  get emptyGroups(): number {
    return (
      this.totalGroups -
      this.groupsWithUsers
    );
  }
}