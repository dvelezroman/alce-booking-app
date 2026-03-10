import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardNotificationsWidgetComponent } from './dashboard-notifications-widget.component';

describe('DashboardNotificationsWidgetComponent', () => {
  let component: DashboardNotificationsWidgetComponent;
  let fixture: ComponentFixture<DashboardNotificationsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardNotificationsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardNotificationsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
