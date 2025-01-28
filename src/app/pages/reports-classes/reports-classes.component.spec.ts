import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsClassesComponent } from './reports-classes.component';

describe('ReportsClassesComponent', () => {
  let component: ReportsClassesComponent;
  let fixture: ComponentFixture<ReportsClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsClassesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
