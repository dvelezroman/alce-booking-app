import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { selectUserData } from '../../../store/user.selector';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userData$: Observable<UserDto | null>;

  constructor(private store: Store) {
    this.userData$ = this.store.select(selectUserData);
  }
}