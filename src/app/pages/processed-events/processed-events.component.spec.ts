import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessedEventsComponent } from './processed-events.component';

describe('ProcessedEventsComponent', () => {
  let component: ProcessedEventsComponent;
  let fixture: ComponentFixture<ProcessedEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessedEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessedEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
