import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingEvaluationsTableComponent } from './meeting-evaluations-table.component';

describe('MeetingEvaluationsTableComponent', () => {
  let component: MeetingEvaluationsTableComponent;
  let fixture: ComponentFixture<MeetingEvaluationsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingEvaluationsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingEvaluationsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
