import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewPanelComponent } from './preview-panel.component';

describe('PreviewPanelComponent', () => {
  let component: PreviewPanelComponent;
  let fixture: ComponentFixture<PreviewPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
