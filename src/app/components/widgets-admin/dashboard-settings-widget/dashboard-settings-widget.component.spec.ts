import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSettingsWidgetComponent } from './dashboard-settings-widget.component';

describe('DashboardSettingsWidgetComponent', () => {
  let component: DashboardSettingsWidgetComponent;
  let fixture: ComponentFixture<DashboardSettingsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSettingsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSettingsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
