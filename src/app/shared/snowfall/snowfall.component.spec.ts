import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnowfallComponent } from './snowfall.component';

describe('SnowfallComponent', () => {
  let component: SnowfallComponent;
  let fixture: ComponentFixture<SnowfallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnowfallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnowfallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
