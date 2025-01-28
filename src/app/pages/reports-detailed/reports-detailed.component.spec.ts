import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsDetailedComponent } from './reports-detailed.component';

describe('ReportsDetailedComponent', () => {
  let component: ReportsDetailedComponent;
  let fixture: ComponentFixture<ReportsDetailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsDetailedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
