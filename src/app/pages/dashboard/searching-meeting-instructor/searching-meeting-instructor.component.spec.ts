import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchingMeetingInstructorComponent } from './searching-meeting-instructor.component';

describe('SearchingMeetingInstructorComponent', () => {
  let component: SearchingMeetingInstructorComponent;
  let fixture: ComponentFixture<SearchingMeetingInstructorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchingMeetingInstructorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchingMeetingInstructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
