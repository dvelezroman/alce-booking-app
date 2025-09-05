import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageComposerComponent } from './message-composer.component';

describe('MessageComposerComponent', () => {
  let component: MessageComposerComponent;
  let fixture: ComponentFixture<MessageComposerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageComposerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageComposerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
