import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUserTableComponent } from './report-user-table.component';

describe('ReportUserTableComponent', () => {
  let component: ReportUserTableComponent;
  let fixture: ComponentFixture<ReportUserTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportUserTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
