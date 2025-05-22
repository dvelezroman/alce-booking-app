import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentTableReportsComponent } from './assessment-table-reports.component';

describe('AssessmentTableReportsComponent', () => {
  let component: AssessmentTableReportsComponent;
  let fixture: ComponentFixture<AssessmentTableReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentTableReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentTableReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
