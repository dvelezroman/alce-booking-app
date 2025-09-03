import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsSentComponent } from './notifications-sent.component';

describe('NotificationsSentComponent', () => {
  let component: NotificationsSentComponent;
  let fixture: ComponentFixture<NotificationsSentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsSentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
