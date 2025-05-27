import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceInstructorComponent } from './attendance-instructor.component';

describe('AttendanceInstructorComponent', () => {
  let component: AttendanceInstructorComponent;
  let fixture: ComponentFixture<AttendanceInstructorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceInstructorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceInstructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
