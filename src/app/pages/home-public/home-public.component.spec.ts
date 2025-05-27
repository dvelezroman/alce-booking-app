import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePublicComponent } from './home-public.component';

describe('HomePublicComponent', () => {
  let component: HomePublicComponent;
  let fixture: ComponentFixture<HomePublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
