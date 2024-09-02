import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingBookingComponent } from './meeting-booking.component';

describe('MeetingBookingComponent', () => {
  let component: MeetingBookingComponent;
  let fixture: ComponentFixture<MeetingBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
