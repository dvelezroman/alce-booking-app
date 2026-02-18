import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentHistoryReportComponent } from './student-history-report.component';

describe('StudentHistoryReportComponent', () => {
  let component: StudentHistoryReportComponent;
  let fixture: ComponentFixture<StudentHistoryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentHistoryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentHistoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
