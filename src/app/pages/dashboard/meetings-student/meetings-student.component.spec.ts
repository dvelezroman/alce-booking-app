import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsStudentComponent } from './meetings-student.component';

describe('MeetingsStudentComponent', () => {
  let component: MeetingsStudentComponent;
  let fixture: ComponentFixture<MeetingsStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingsStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingsStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
