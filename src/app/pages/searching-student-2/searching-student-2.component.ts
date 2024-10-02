import { Component } from '@angular/core';
import {UserDto} from "../../services/dtos/user.dto";
import {UsersService} from "../../services/users.service";
import {DecimalPipe, NgForOf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-searching-student-2',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    DecimalPipe
  ],
  templateUrl: './searching-student-2.component.html',
  styleUrl: './searching-student-2.component.scss'
})
export class SearchingStudent2Component {
  users: UserDto[] = [];
  totalUsers: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 2; // Set the number of items per page
  searchParams = {
    email: '',
    firstName: '',
    lastName: '',
    status: '',
    role: '',
    register: false
  };

  constructor(
    private usersService: UsersService,
  ) {}

  searchUsers() {
    this.usersService.searchUsers(
      this.currentPage,
      this.itemsPerPage,
      this.searchParams.email,
      this.searchParams.firstName,
      this.searchParams.lastName,
      this.searchParams.status,
      this.searchParams.role,
      this.searchParams.register,
    ).subscribe(response => {
      this.users = response.users;
      this.totalUsers = response.total; // Update the total count
    });
  }

  changePage(page: number) {
    this.currentPage = page;
    this.searchUsers(); // Re-fetch the results for the new page
  }
}
