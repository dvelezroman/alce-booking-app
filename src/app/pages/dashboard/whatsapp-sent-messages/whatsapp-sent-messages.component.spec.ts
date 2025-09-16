import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappSentMessagesComponent } from './whatsapp-sent-messages.component';

describe('WhatsappSentMessagesComponent', () => {
  let component: WhatsappSentMessagesComponent;
  let fixture: ComponentFixture<WhatsappSentMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappSentMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappSentMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
