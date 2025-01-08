import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterInstructorAdminComponent } from './register-instructor-admin.component';

describe('RegisterInstructorAdminComponent', () => {
  let component: RegisterInstructorAdminComponent;
  let fixture: ComponentFixture<RegisterInstructorAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterInstructorAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterInstructorAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
