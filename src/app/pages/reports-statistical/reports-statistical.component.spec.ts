import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsStatisticalComponent } from './reports-statistical.component';

describe('ReportsStatisticalComponent', () => {
  let component: ReportsStatisticalComponent;
  let fixture: ComponentFixture<ReportsStatisticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsStatisticalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsStatisticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
