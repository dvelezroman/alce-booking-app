import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingFilterComponent } from './meeting-filter.component';

describe('MeetingFilterComponent', () => {
  let component: MeetingFilterComponent;
  let fixture: ComponentFixture<MeetingFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
