import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingEvaluationsComponent } from './meeting-evaluations.component';

describe('MeetingEvaluationsComponent', () => {
  let component: MeetingEvaluationsComponent;
  let fixture: ComponentFixture<MeetingEvaluationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingEvaluationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingEvaluationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
