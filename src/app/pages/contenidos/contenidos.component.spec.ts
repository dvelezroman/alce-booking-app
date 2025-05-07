import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenidosComponent } from './contenidos.component';

describe('ContenidosComponent', () => {
  let component: ContenidosComponent;
  let fixture: ComponentFixture<ContenidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
