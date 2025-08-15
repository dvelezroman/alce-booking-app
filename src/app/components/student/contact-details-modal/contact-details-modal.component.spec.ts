import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDetailsModalComponent } from './contact-details-modal.component';

describe('ContactDetailsModalComponent', () => {
  let component: ContactDetailsModalComponent;
  let fixture: ComponentFixture<ContactDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
