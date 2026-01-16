import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingEvaluationDetailModalComponent } from './meeting-evaluation-detail-modal.component';

describe('MeetingEvaluationDetailModalComponent', () => {
  let component: MeetingEvaluationDetailModalComponent;
  let fixture: ComponentFixture<MeetingEvaluationDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingEvaluationDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingEvaluationDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
