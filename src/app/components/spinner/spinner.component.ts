import {Component, OnInit} from '@angular/core';
import {SpinnerService} from "../../services/spinner.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent implements OnInit {
  isLoading = false;

  constructor(private spinnerService: SpinnerService) {}

  ngOnInit(): void {
    this.spinnerService.spinnerState$.subscribe(state => {
      this.isLoading = state;
    });
  }
}
