import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalNoticeBannerComponent } from './global-notice-banner.component';

describe('GlobalNoticeBannerComponent', () => {
  let component: GlobalNoticeBannerComponent;
  let fixture: ComponentFixture<GlobalNoticeBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalNoticeBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalNoticeBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
