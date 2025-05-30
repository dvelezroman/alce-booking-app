import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceDailySummaryComponent } from './attendance-daily-summary.component';

describe('AttendanceDailySummaryComponent', () => {
  let component: AttendanceDailySummaryComponent;
  let fixture: ComponentFixture<AttendanceDailySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceDailySummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceDailySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
