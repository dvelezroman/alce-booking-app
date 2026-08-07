import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'

@Component({
  selector: 'app-scheduled-meetings-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scheduled-meetings-pagination.component.html',
  styleUrls: ['./scheduled-meetings-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduledMeetingsPaginationComponent {
  @Input()
  currentPage = 1

  @Input()
  totalPages = 1

  @Input()
  totalItems = 0

  @Input()
  itemsPerPage = 10

  @Output()
  pageChange = new EventEmitter<number>()

  get firstVisibleItem(): number {
    if (this.totalItems === 0) {
      return 0
    }

    return (
      (this.currentPage - 1) *
        this.itemsPerPage +
      1
    )
  }

  get lastVisibleItem(): number {
    if (this.totalItems === 0) {
      return 0
    }

    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.totalItems
    )
  }

  get visiblePages(): number[] {
    const pages: number[] = []
    const maxVisiblePages = 5

    if (this.totalPages <= maxVisiblePages) {
      for (
        let page = 1;
        page <= this.totalPages;
        page++
      ) {
        pages.push(page)
      }

      return pages
    }

    let startPage = Math.max(
      1,
      this.currentPage - 2
    )

    let endPage = Math.min(
      this.totalPages,
      startPage + maxVisiblePages - 1
    )

    if (
      endPage - startPage + 1 <
      maxVisiblePages
    ) {
      startPage = Math.max(
        1,
        endPage - maxVisiblePages + 1
      )
    }

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(page)
    }

    return pages
  }

  get showStartEllipsis(): boolean {
    return (
      this.visiblePages.length > 0 &&
      this.visiblePages[0] > 2
    )
  }

  get showEndEllipsis(): boolean {
    return (
      this.visiblePages.length > 0 &&
      this.visiblePages[
        this.visiblePages.length - 1
      ] <
        this.totalPages - 1
    )
  }

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return
    }

    this.pageChange.emit(page)
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1)
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1)
  }

  trackByPage(
    index: number,
    page: number
  ): number {
    return page
  }
}