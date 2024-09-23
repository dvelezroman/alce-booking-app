import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingUpdateLinkComponent } from './meeting-update-link.component';

describe('MeetingUpdateLinkComponent', () => {
  let component: MeetingUpdateLinkComponent;
  let fixture: ComponentFixture<MeetingUpdateLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingUpdateLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingUpdateLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
