import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchingStudent2Component } from './searching-student-2.component';

describe('SearchingStudent2Component', () => {
  let component: SearchingStudent2Component;
  let fixture: ComponentFixture<SearchingStudent2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchingStudent2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchingStudent2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
