import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlceKidsAvisoComponent } from './alce-kids-aviso.component';

describe('AlceKidsAvisoComponent', () => {
  let component: AlceKidsAvisoComponent;
  let fixture: ComponentFixture<AlceKidsAvisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlceKidsAvisoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlceKidsAvisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
