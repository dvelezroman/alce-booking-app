import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsResultsComponent } from './reports-results.component';

describe('ReportsResultsComponent', () => {
  let component: ReportsResultsComponent;
  let fixture: ComponentFixture<ReportsResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
