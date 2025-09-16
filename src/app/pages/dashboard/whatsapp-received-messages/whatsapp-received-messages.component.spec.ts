import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappReceivedMessagesComponent } from './whatsapp-received-messages.component';

describe('WhatsappReceivedMessagesComponent', () => {
  let component: WhatsappReceivedMessagesComponent;
  let fixture: ComponentFixture<WhatsappReceivedMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappReceivedMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappReceivedMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
