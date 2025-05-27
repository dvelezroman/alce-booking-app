import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCompleteComponent } from './register-complete.component';

describe('RegisterComponent', () => {
  let component: RegisterCompleteComponent;
  let fixture: ComponentFixture<RegisterCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
