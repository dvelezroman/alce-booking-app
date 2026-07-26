import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evaluation-tabs',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './evaluation-tabs.component.html',
  styleUrl: './evaluation-tabs.component.scss'
})
export class EvaluationTabsComponent {

  @Input()
  activeTab: 'pending' | 'completed' = 'pending';

  @Input()
  pendingCount = 0;

  @Input()
  completedCount = 0;

  @Output()
  tabChange = new EventEmitter<
    'pending' | 'completed'
  >();

  onSelectTab(
    tab: 'pending' | 'completed'
  ): void {
    if (this.activeTab === tab) {
      return;
    }

    this.tabChange.emit(tab);
  }

  isTabActive(
    tab: 'pending' | 'completed'
  ): boolean {
    return this.activeTab === tab;
  }
}