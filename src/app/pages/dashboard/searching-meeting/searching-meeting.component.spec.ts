import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchingMeetingComponent } from './searching-meeting.component';

describe('SearchingMeetingComponent', () => {
  let component: SearchingMeetingComponent;
  let fixture: ComponentFixture<SearchingMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchingMeetingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchingMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
