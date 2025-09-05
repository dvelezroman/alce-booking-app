import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastFiltersComponent } from './broadcast-filters.component';

describe('BroadcastFiltersComponent', () => {
  let component: BroadcastFiltersComponent;
  let fixture: ComponentFixture<BroadcastFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
