import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentContentHistoryModalComponent } from './student-content-history-modal.component';

describe('StudentContentHistoryModalComponent', () => {
  let component: StudentContentHistoryModalComponent;
  let fixture: ComponentFixture<StudentContentHistoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentContentHistoryModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentContentHistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
