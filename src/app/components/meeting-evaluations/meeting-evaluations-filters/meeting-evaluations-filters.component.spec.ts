import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingEvaluationsFiltersComponent } from './meeting-evaluations-filters.component';

describe('MeetingEvaluationsFiltersComponent', () => {
  let component: MeetingEvaluationsFiltersComponent;
  let fixture: ComponentFixture<MeetingEvaluationsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingEvaluationsFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingEvaluationsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
